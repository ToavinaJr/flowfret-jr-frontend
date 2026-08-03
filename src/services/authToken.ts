const ACCESS_TOKEN_KEY = "fretflow-access-token";
const USER_ID_KEY = "fretflow-user-id";
const USERNAME_KEY = "fretflow-username";
const USER_EMAIL_KEY = "fretflow-user-email";

function getStoredValue(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function setStoredValue(key: string, value: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, value);
  }
}

function removeStoredValue(key: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
}

export function getAccessToken(): string | null {
  return getStoredValue(ACCESS_TOKEN_KEY);
}

export function setAuthSession(params: {
  accessToken: string;
  userId: string;
  username: string;
  email: string;
}): void {
  setStoredValue(ACCESS_TOKEN_KEY, params.accessToken);
  setStoredValue(USER_ID_KEY, params.userId);
  setStoredValue(USERNAME_KEY, params.username);
  setStoredValue(USER_EMAIL_KEY, params.email);
}

export function clearAuthSession(): void {
  removeStoredValue(ACCESS_TOKEN_KEY);
  removeStoredValue(USER_ID_KEY);
  removeStoredValue(USERNAME_KEY);
  removeStoredValue(USER_EMAIL_KEY);
}

export function getCurrentUserId(): string | null {
  return getStoredValue(USER_ID_KEY);
}

export function getCurrentUsername(): string | null {
  return getStoredValue(USERNAME_KEY);
}

export function getCurrentUserEmail(): string | null {
  return getStoredValue(USER_EMAIL_KEY);
}
