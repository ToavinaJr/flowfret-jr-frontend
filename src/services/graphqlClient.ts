import { ApiClientError, type GraphQLResponse } from "@/types/api";
import { GRAPHQL_URL } from "@/services/backend";
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from "@/services/authToken";
import {
  classifyGraphQLError,
  getSafeErrorMessage,
} from "@/utils/safeError";
import { debugError, debugLog } from "@/utils/debug";

interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, string | number | boolean | object | null>;
}

let refreshPromise: Promise<boolean> | null = null;
const GRAPHQL_TIMEOUT_MS = 15_000;
const AUTH_REFRESH_LOCK = "flowfret:auth-refresh";
const AUTH_REFRESH_LOCK_KEY = "flowfret:auth-refresh-lock";
const AUTH_REFRESH_LOCK_TTL_MS = 30_000;
type AuthRefreshLock = { owner?: string; expiresAt?: number };

async function fetchGraphQL(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), GRAPHQL_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

function isAuthenticationError(message: string): boolean {
  return /unauthenticated|unauthorized|jwt expired|invalid token/i.test(message);
}

/** Refresh the access token using the HttpOnly session cookie. Shared by GraphQL and REST clients. */
export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = withAuthRefreshLock(async () => {
    try {
      const response = await fetchGraphQL(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Apollo-Require-Preflight": "true",
        },
        credentials: "include",
        body: JSON.stringify({
          query: `mutation RefreshSession { refreshSession { accessToken } }`,
        }),
      });
      if (response.status === 401) {
        clearAuthSession();
        return false;
      }
      if (!response.ok) return false;

      const body = (await response.json()) as GraphQLResponse<{
        refreshSession: { accessToken: string };
      }>;
      const session = body.data?.refreshSession;
      if (body.errors?.some(isExplicitAuthenticationRejection)) {
        clearAuthSession();
        return false;
      }
      if (body.errors?.length || !session) return false;
      setAccessToken(session.accessToken);
      return true;
    } catch {
      return false;
    }
  }).catch(() => false).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

function isExplicitAuthenticationRejection(
  error: NonNullable<GraphQLResponse<never>["errors"]>[number],
): boolean {
  return error.extensions?.code === "UNAUTHENTICATED";
}

async function withAuthRefreshLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    return navigator.locks.request(AUTH_REFRESH_LOCK, operation);
  }

  return withLocalStorageRefreshLock(operation);
}

async function withLocalStorageRefreshLock<T>(
  operation: () => Promise<T>,
): Promise<T> {
  if (typeof window === "undefined") return operation();

  let storage: Storage;
  try {
    storage = window.localStorage;
  } catch {
    return operation();
  }

  const owner = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const deadline = Date.now() + GRAPHQL_TIMEOUT_MS + 5_000;
  while (Date.now() < deadline) {
    let current: AuthRefreshLock | null = null;
    try {
      const value = storage.getItem(AUTH_REFRESH_LOCK_KEY);
      current = value ? (JSON.parse(value) as AuthRefreshLock) : null;
    } catch {
      current = null;
    }

    if (!current?.owner || (current.expiresAt ?? 0) <= Date.now()) {
      let claimed = false;
      try {
        storage.setItem(
          AUTH_REFRESH_LOCK_KEY,
          JSON.stringify({
            owner,
            expiresAt: Date.now() + AUTH_REFRESH_LOCK_TTL_MS,
          }),
        );
        const storedClaim = JSON.parse(
          storage.getItem(AUTH_REFRESH_LOCK_KEY) ?? "null",
        ) as AuthRefreshLock | null;
        claimed = storedClaim?.owner === owner;
      } catch {
        return operation();
      }
      if (claimed) {
        try {
          return await operation();
        } finally {
          try {
            const latest = JSON.parse(
              storage.getItem(AUTH_REFRESH_LOCK_KEY) ?? "null",
            ) as AuthRefreshLock | null;
            if (latest?.owner === owner)
              storage.removeItem(AUTH_REFRESH_LOCK_KEY);
          } catch {
            // The operation already completed; an unavailable storage cleanup
            // must not turn its result into a failed refresh.
          }
        }
      }
    }

    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  throw new Error("Timed out waiting for the cross-tab refresh lock");
}

function toSafeApiError(
  rawMessage: string,
  status: number,
  graphQLErrors: GraphQLResponse<never>["errors"] = [],
): ApiClientError {
  const kind = classifyGraphQLError(rawMessage, status);
  return new ApiClientError(
    getSafeErrorMessage(kind, rawMessage),
    status,
    graphQLErrors,
  );
}

export async function graphqlRequest<TData>(
  options: GraphQLRequestOptions,
  hasRetriedAfterRefresh = false,
): Promise<TData> {
  const token = getAccessToken();
  const operation =
    options.query.match(/(?:query|mutation)\s+(\w+)/)?.[1] ?? "anonymous";
  const startedAt = performance.now();
  debugLog("graphql.request", {
    operation,
    url: GRAPHQL_URL,
    authenticated: Boolean(token),
  });

  let response: Response;
  try {
    response = await fetchGraphQL(GRAPHQL_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        // Apollo Server's CSRF prevention requires an explicit preflight
        // signal for cross-origin requests. This also keeps the contract
        // stable when a proxy changes the request's content-type handling.
        "Apollo-Require-Preflight": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        query: options.query,
        variables: options.variables ?? {},
      }),
    });
  } catch (error) {
    debugError("graphql.network_error", { operation, error });
    throw toSafeApiError("network failure", 0);
  }

  let body: GraphQLResponse<TData>;
  try {
    body = (await response.json()) as GraphQLResponse<TData>;
  } catch (error) {
    debugError("graphql.invalid_response", {
      operation,
      status: response.status,
      error,
    });
    throw toSafeApiError("invalid response", response.status);
  }

  debugLog("graphql.response", {
    operation,
    status: response.status,
    durationMs: Math.round(performance.now() - startedAt),
    errors: body.errors,
  });

  if (!response.ok) {
    const raw = body.errors?.[0]?.message ?? "request failed";
    if (
      token &&
      !hasRetriedAfterRefresh &&
      operation !== "RefreshSession" &&
      isAuthenticationError(raw) &&
      (await refreshAccessToken())
    ) {
      return graphqlRequest<TData>(options, true);
    }
    throw toSafeApiError(raw, response.status, body.errors ?? []);
  }

  if (body.errors && body.errors.length > 0) {
    if (
      operation !== "RefreshSession" &&
      token &&
      !hasRetriedAfterRefresh &&
      isAuthenticationError(body.errors[0].message) &&
      await refreshAccessToken()
    ) {
      return graphqlRequest<TData>(options, true);
    }
    throw toSafeApiError(body.errors[0].message, response.status, body.errors);
  }

  if (!body.data) {
    throw toSafeApiError("empty response", response.status);
  }

  return body.data;
}
