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

function isAuthenticationError(message: string): boolean {
  return /unauthenticated|unauthorized|jwt expired|invalid token/i.test(message);
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: `mutation RefreshSession { refreshSession { accessToken } }`,
        }),
      });
      const body = (await response.json()) as GraphQLResponse<{
        refreshSession: { accessToken: string };
      }>;
      const session = body.data?.refreshSession;
      if (!response.ok || body.errors?.length || !session) {
        clearAuthSession();
        return false;
      }
      setAccessToken(session.accessToken);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
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
    response = await fetch(GRAPHQL_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
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
    if (!hasRetriedAfterRefresh && operation !== "RefreshSession" && isAuthenticationError(raw) && await refreshAccessToken()) {
      return graphqlRequest<TData>(options, true);
    }
    throw toSafeApiError(raw, response.status, body.errors ?? []);
  }

  if (body.errors && body.errors.length > 0) {
    if (
      operation !== "RefreshSession" &&
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
