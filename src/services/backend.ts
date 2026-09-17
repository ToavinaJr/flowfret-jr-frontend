type RuntimeLocation = Pick<Location, "hostname" | "origin" | "protocol">;

function getDefaultGraphqlUrl(location?: RuntimeLocation): string {
  if (!location) {
    return "http://localhost:3000/graphql";
  }
  const host = location.hostname || "localhost";
  return `http://${host}:3000/graphql`;
}

export function resolveGraphqlUrl(
  configuredValue: string | undefined,
  location: RuntimeLocation | undefined,
  production: boolean,
): string {
  const configured = configuredValue?.trim();
  if (!configured) {
    if (production) {
      throw new Error("VITE_GRAPHQL_URL is required for production builds.");
    }
    return getDefaultGraphqlUrl(location);
  }
  try {
    const url = new URL(configured);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Unsupported protocol");
    }
    if ((production || location?.protocol === "https:") && url.protocol !== "https:") {
      throw new Error("Production GraphQL endpoints must use HTTPS");
    }
    return url.toString().replace(/\/$/, "");
  } catch (error) {
    throw new Error(
      `Invalid VITE_GRAPHQL_URL (${configured}): ${error instanceof Error ? error.message : "invalid URL"}`,
    );
  }
}

export const GRAPHQL_URL = resolveGraphqlUrl(
  import.meta.env.VITE_GRAPHQL_URL,
  typeof window === "undefined" ? undefined : window.location,
  import.meta.env.PROD,
);
