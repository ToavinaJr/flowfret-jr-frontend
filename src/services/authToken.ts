const ACCESS_TOKEN_KEY = "fretflow-access-token";
const USER_ID_KEY = "fretflow-user-id";
const USERNAME_KEY = "fretflow-username";
const USER_EMAIL_KEY = "fretflow-user-email";
const LEGACY_REFRESH_TOKEN_KEY = "fretflow-refresh-token";
export const AUTH_SESSION_CLEARED_EVENT = "flowfret:auth-session-cleared";
let accessTokenInMemory: string | null = null;

function removeStoredValue(key: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
}

export function getAccessToken(): string | null {
  return accessTokenInMemory;
}

export function setAccessToken(accessToken: string): void {
  accessTokenInMemory = accessToken;
  // Remove tokens persisted by older application versions.
  removeStoredValue(ACCESS_TOKEN_KEY);
  removeStoredValue(LEGACY_REFRESH_TOKEN_KEY);
}

export function setAuthSession(params: {
  accessToken: string;
  userId: string;
  username: string;
  email: string;
}): void {
  setAccessToken(params.accessToken);
  removeStoredValue(USER_ID_KEY);
  removeStoredValue(USERNAME_KEY);
  removeStoredValue(USER_EMAIL_KEY);
}

export function clearAuthSession(): void {
  accessTokenInMemory = null;
  removeStoredValue(ACCESS_TOKEN_KEY);
  removeStoredValue(LEGACY_REFRESH_TOKEN_KEY);
  removeStoredValue(USER_ID_KEY);
  removeStoredValue(USERNAME_KEY);
  removeStoredValue(USER_EMAIL_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
  }
}
