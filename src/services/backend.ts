function getDefaultGraphqlUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost:3000/graphql";
  }
  const host = window.location.hostname || "localhost";
  return `http://${host}:3000/graphql`;
}

export const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL ?? getDefaultGraphqlUrl();
