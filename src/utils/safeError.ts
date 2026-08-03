/**
 * Maps API failures to safe, user-facing messages.
 * Never forward raw Prisma / SQL / stack traces to the UI.
 */

export type UserFacingErrorKind =
  | "auth"
  | "network"
  | "conflict"
  | "forbidden"
  | "not_found"
  | "validation"
  | "generic";

const SAFE_MESSAGES: Record<UserFacingErrorKind, string> = {
  auth: "Unable to sign in. Check your credentials and try again.",
  network: "Unable to reach the server. Please try again later.",
  conflict: "This account information is already in use.",
  forbidden: "You don’t have permission to do that.",
  not_found: "The requested resource was not found.",
  validation: "Some information is invalid. Please check and try again.",
  generic: "Something went wrong. Please try again later.",
};

const ALLOWED_EXACT_MESSAGES = new Set([
  "Invalid credentials",
  "Email or username already in use",
]);

function looksLikeInternalError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("prisma") ||
    lower.includes("invocation") ||
    lower.includes("select ") ||
    lower.includes("insert ") ||
    lower.includes("update ") ||
    lower.includes("delete ") ||
    lower.includes("table ") ||
    lower.includes("column ") ||
    lower.includes("database") ||
    lower.includes("sql") ||
    lower.includes("schema") ||
    lower.includes("public.") ||
    lower.includes("stack") ||
    lower.includes("at Object.") ||
    lower.includes("node_modules") ||
    message.length > 180
  );
}

export function getSafeErrorMessage(
  kind: UserFacingErrorKind,
  rawMessage?: string,
): string {
  if (rawMessage && ALLOWED_EXACT_MESSAGES.has(rawMessage)) {
    return rawMessage;
  }
  if (rawMessage && !looksLikeInternalError(rawMessage)) {
    // Short, non-technical Nest HttpException messages may pass through
    if (rawMessage.length <= 120 && !rawMessage.includes("`")) {
      return rawMessage;
    }
  }
  return SAFE_MESSAGES[kind];
}

export function classifyGraphQLError(
  message: string,
  status: number,
): UserFacingErrorKind {
  if (status === 0 || status >= 500 || looksLikeInternalError(message)) {
    return "generic";
  }
  if (status === 401 || /credential|unauthorized|unauthenticated/i.test(message)) {
    return "auth";
  }
  if (status === 403 || /forbidden|permission/i.test(message)) {
    return "forbidden";
  }
  if (status === 404 || /not found/i.test(message)) {
    return "not_found";
  }
  if (status === 409 || /already in use|conflict|duplicate/i.test(message)) {
    return "conflict";
  }
  if (status === 400 || /validation|invalid|bad request/i.test(message)) {
    return "validation";
  }
  if (status === 502 || status === 503 || status === 504) {
    return "network";
  }
  return "generic";
}
