import { runtimeConfig } from "@/config/runtime";

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface GoogleTokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (error: GoogleTokenError) => void;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenError {
  type?: string;
  message?: string;
}

interface GoogleAccountsOauth2 {
  initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
}

interface GoogleAccounts {
  oauth2: GoogleAccountsOauth2;
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }

  const pendingScript = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Google Identity script failed to load')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Google Identity script failed to load'));
    document.head.appendChild(script);
  });

  scriptPromise = pendingScript;
  void pendingScript.catch(() => {
    if (scriptPromise === pendingScript) scriptPromise = null;
  });
  return pendingScript;
}

export function getGoogleClientId(): string {
  return runtimeConfig.googleClientId;
}

export async function prepareGoogleIdentity(): Promise<void> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google Client ID is not configured.');
  }

  await loadGoogleIdentityScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services unavailable.');
  }
}

export function requestGoogleAccessToken(): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    return Promise.reject(new Error('Google Client ID is not configured.'));
  }
  if (!window.google?.accounts?.oauth2) {
    return Promise.reject(new Error('Google Identity Services unavailable.'));
  }

  return new Promise<string>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (response: GoogleTokenResponse) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description ??
                response.error ??
                'Google sign-in was cancelled.',
            ),
          );
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (error: GoogleTokenError) => {
        reject(
          new Error(error.message ?? error.type ?? 'Google sign-in failed.'),
        );
      },
    });

    client.requestAccessToken({ prompt: 'select_account' });
  });
}
