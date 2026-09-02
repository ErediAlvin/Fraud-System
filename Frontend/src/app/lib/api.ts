/**
 * DSFMP Fraud Detection — API Client
 *
 * Centralized HTTP client for all backend communication.
 * Automatically injects the JWT access token into every request
 * and handles token refresh on 401 responses.
 */

const API_BASE = '/api';

/** Shape of the stored auth tokens */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Read tokens from localStorage */
export function getStoredTokens(): AuthTokens | null {
  const raw = localStorage.getItem('dsfmp_tokens');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Persist tokens to localStorage */
export function storeTokens(tokens: AuthTokens): void {
  localStorage.setItem('dsfmp_tokens', JSON.stringify(tokens));
}

/** Clear tokens (logout) */
export function clearTokens(): void {
  localStorage.removeItem('dsfmp_tokens');
}

/**
 * Core fetch wrapper.
 * - Injects Authorization header with Bearer token
 * - Attempts one silent token refresh on 401
 * - Redirects to /login if refresh also fails
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const tokens = getStoredTokens();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — try refreshing the token once
  if (res.status === 401 && retry && tokens?.refreshToken) {
    const refreshed = await refreshAccessToken(tokens.refreshToken);
    if (refreshed) {
      return request<T>(endpoint, options, false);
    }
    // Refresh failed — clear everything and redirect
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.detail || `Request failed: ${res.status}`);
    (error as any).status = res.status;
    (error as any).body = body;
    throw error;
  }

  return res.json();
}

/** Attempt to refresh the access token silently */
async function refreshAccessToken(refreshToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    storeTokens({
      accessToken: data.access_token || data.accessToken,
      refreshToken: data.refresh_token || data.refreshToken,
    });
    return true;
  } catch {
    return false;
  }
}

// ── Public API Methods ──────────────────────────

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
