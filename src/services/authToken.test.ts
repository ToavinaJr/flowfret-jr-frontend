import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAuthSession,
  getAccessToken,
  setAuthSession,
} from './authToken';

describe('auth token storage', () => {
  beforeEach(() => {
    localStorage.clear();
    clearAuthSession();
  });

  it('keeps access tokens in memory and does not persist identity data', () => {
    setAuthSession({
      accessToken: 'secret-access-token',
      userId: 'user-1',
      username: 'guitarist',
      email: 'guitarist@example.test',
    });

    expect(getAccessToken()).toBe('secret-access-token');
    expect(localStorage.length).toBe(0);
  });

  it('clears the in-memory token when the session is cleared', () => {
    setAuthSession({
      accessToken: 'secret-access-token',
      userId: 'user-1',
      username: 'guitarist',
      email: 'guitarist@example.test',
    });

    clearAuthSession();

    expect(getAccessToken()).toBeNull();
    expect(localStorage.length).toBe(0);
  });
});
