/**
 * Maps API failures to safe, user-facing messages (FR).
 * Never forward GraphQL schema errors, Prisma/SQL, or stack traces to the UI.
 * Only allowlisted backend messages may pass through (translated).
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
  auth: "Impossible de se connecter. Vérifiez vos identifiants.",
  network: "Impossible de joindre le serveur. Réessayez plus tard.",
  conflict: "Ces informations de compte sont déjà utilisées.",
  forbidden: "Vous n’avez pas la permission d’effectuer cette action.",
  not_found: "La ressource demandée est introuvable.",
  validation: "Certaines informations sont invalides. Vérifiez et réessayez.",
  generic: "Une erreur est survenue. Réessayez plus tard.",
};

/** Backend exception messages that are safe to show (after FR mapping). */
const ALLOWED_EXACT_MESSAGES = new Set([
  "Invalid credentials",
  "Email or username already in use",
  "Account not verified. Please validate the OTP sent to your email.",
  "Account is not active.",
  "OTP must be a 4-digit code.",
  "Invalid or already used verification link.",
  "Verification code has expired.",
  "Invalid verification code.",
  "Invalid verification link.",
  "Account is already verified.",
]);

const MESSAGE_FR: Record<string, string> = {
  "Invalid credentials": "Identifiants invalides.",
  "Email or username already in use":
    "Cet e-mail ou ce nom d’utilisateur est déjà utilisé.",
  "Account not verified. Please validate the OTP sent to your email.":
    "Compte non vérifié. Validez le code OTP envoyé par e-mail.",
  "Account is not active.": "Ce compte n’est pas actif.",
  "OTP must be a 4-digit code.": "Le code OTP doit contenir 4 chiffres.",
  "Invalid or already used verification link.":
    "Lien de vérification invalide ou déjà utilisé.",
  "Verification code has expired.": "Le code de vérification a expiré.",
  "Invalid verification code.": "Code de vérification invalide.",
  "Invalid verification link.": "Lien de vérification invalide.",
  "Account is already verified.": "Ce compte est déjà vérifié.",
};

function looksLikeInternalOrSchemaError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("cannot query field") ||
    lower.includes("cannot return null") ||
    lower.includes("unknown type") ||
    lower.includes("unknown argument") ||
    lower.includes("field \"") ||
    lower.includes("on type") ||
    lower.includes("graphql") ||
    lower.includes("syntax error") ||
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
    lower.includes("at object.") ||
    lower.includes("node_modules") ||
    lower.includes("etag") ||
    message.includes("`") ||
    message.length > 160
  );
}

export function getSafeErrorMessage(
  kind: UserFacingErrorKind,
  rawMessage?: string,
): string {
  if (!rawMessage) {
    return SAFE_MESSAGES[kind];
  }

  // Already a known French UI message — keep it.
  const knownFr = Object.values(MESSAGE_FR);
  if (knownFr.includes(rawMessage) || Object.values(SAFE_MESSAGES).includes(rawMessage)) {
    return rawMessage;
  }

  if (ALLOWED_EXACT_MESSAGES.has(rawMessage)) {
    return MESSAGE_FR[rawMessage] ?? SAFE_MESSAGES[kind];
  }

  // Never surface GraphQL / DB / stack internals to the user.
  if (looksLikeInternalOrSchemaError(rawMessage)) {
    return SAFE_MESSAGES[kind];
  }

  return SAFE_MESSAGES[kind];
}

export function classifyGraphQLError(
  message: string,
  status: number,
): UserFacingErrorKind {
  if (
    status === 0 ||
    status >= 500 ||
    looksLikeInternalOrSchemaError(message)
  ) {
    return "generic";
  }
  if (status === 401 || /credential|unauthorized|unauthenticated/i.test(message)) {
    return "auth";
  }
  if (
    status === 403 ||
    /forbidden|permission|not verified|not active/i.test(message)
  ) {
    return "forbidden";
  }
  if (status === 404 || /not found/i.test(message)) {
    return "not_found";
  }
  if (status === 409 || /already in use|conflict|duplicate/i.test(message)) {
    return "conflict";
  }
  if (
    status === 400 ||
    /validation|invalid|bad request|expired|otp/i.test(message)
  ) {
    return "validation";
  }
  if (status === 502 || status === 503 || status === 504) {
    return "network";
  }
  return "generic";
}
