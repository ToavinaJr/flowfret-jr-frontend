function getDefaultGraphqlUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost:3000/graphql";
  }
  const host = window.location.hostname || "localhost";
  return `http://${host}:3000/graphql`;
}

function getConfiguredGraphqlUrl(): string {
  const configured = import.meta.env.VITE_GRAPHQL_URL?.trim();
  if (!configured) return getDefaultGraphqlUrl();
  try {
    const url = new URL(configured);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol');
    return url.toString().replace(/\/$/, '');
  } catch {
    console.warn(`Invalid VITE_GRAPHQL_URL, using the default backend URL: ${configured}`);
    return getDefaultGraphqlUrl();
  }
}

export const GRAPHQL_URL = getConfiguredGraphqlUrl();
