import { ApiClientError, type GraphQLResponse } from "@/types/api";
import { GRAPHQL_URL } from "@/services/backend";
import { getAccessToken } from "@/services/authToken";
import {
  classifyGraphQLError,
  getSafeErrorMessage,
} from "@/utils/safeError";
import { debugError, debugLog } from "@/utils/debug";

interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, string | number | boolean | object | null>;
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
    throw toSafeApiError(raw, response.status, body.errors ?? []);
  }

  if (body.errors && body.errors.length > 0) {
    throw toSafeApiError(body.errors[0].message, response.status, body.errors);
  }

  if (!body.data) {
    throw toSafeApiError("empty response", response.status);
  }

  return body.data;
}
