import { ApiClientError, type GraphQLResponse } from "@/types/api";
import { GRAPHQL_URL } from "@/services/backend";
import { getAccessToken } from "@/services/authToken";

interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, string | number | boolean | object | null>;
}

export async function graphqlRequest<TData>(
  options: GraphQLRequestOptions,
): Promise<TData> {
  const token = getAccessToken();

  const response = await fetch(GRAPHQL_URL, {
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

  let body: GraphQLResponse<TData>;
  try {
    body = (await response.json()) as GraphQLResponse<TData>;
  } catch {
    throw new ApiClientError("Invalid JSON response from GraphQL API", response.status);
  }

  if (!response.ok) {
    const message = body.errors?.[0]?.message ?? `HTTP ${response.status}`;
    throw new ApiClientError(message, response.status, body.errors ?? []);
  }

  if (body.errors && body.errors.length > 0) {
    throw new ApiClientError(
      body.errors[0].message,
      response.status,
      body.errors,
    );
  }

  if (!body.data) {
    throw new ApiClientError("Empty GraphQL response", response.status);
  }

  return body.data;
}
