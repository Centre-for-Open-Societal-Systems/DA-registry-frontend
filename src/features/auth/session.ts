import { ApiError, apiPost, apiRequest, type ApiRequest } from "@/lib/api";
import { useAuthStore, type AuthTokens } from "@/store/useAuthStore";

/** Successful POST /api/v1/auth/refresh; /auth/login answers in the same shape. */
export interface TokenResponse {
  data: {
    access_token: string;
    /** Seconds the access token stays valid. */
    expires_in: number;
    refresh_token: string;
    token_type: string;
    roles: string[];
    /** Backend user id, e.g. "Administrator" or the user's email. */
    user: string;
  };
}

export const toTokens = ({ data }: TokenResponse, now: number): AuthTokens => ({
  accessToken: data.access_token,
  refreshToken: data.refresh_token,
  expiresAt: now + data.expires_in * 1000,
});

// Refresh this long before the access token's expiry, so a request never leaves with a token about to lapse.
const EXPIRY_SKEW_MS = 30_000;

// Refresh tokens are single-use: the backend rotates them and rejects a reused one with 401. Concurrent
// callers therefore share one in-flight refresh instead of each spending the same token.
let inflight: Promise<string | null> | null = null;

/**
 * POST /api/v1/auth/refresh and store the new token pair. Resolves to the new access token, or null when
 * the session is over (no refresh token, or the backend rejected it) — the user is then signed out.
 * Network and server errors are rethrown and keep the session, so a flaky connection does not log anyone out.
 */
export function refreshSession(): Promise<string | null> {
  inflight ??= (async () => {
    const refreshToken = useAuthStore.getState().tokens?.refreshToken;
    if (!refreshToken) return null;
    try {
      const res = await apiPost<TokenResponse>("/auth/refresh", { refresh_token: refreshToken });
      const tokens = toTokens(res, Date.now());
      useAuthStore.getState().setTokens(tokens);
      return tokens.accessToken;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 401)) {
        // Already spent or revoked: clear the pair first so logout does not try to revoke it again.
        useAuthStore.setState({ tokens: null });
        useAuthStore.getState().logout();
        return null;
      }
      throw err;
    }
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

/** A usable access token, refreshing first when the stored one has expired or is about to. */
export async function getAccessToken(): Promise<string | null> {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens) return null;
  if (tokens.expiresAt - EXPIRY_SKEW_MS > Date.now()) return tokens.accessToken;
  return refreshSession();
}

/** apiRequest for signed-in calls: attaches the Bearer token and retries once after a 401 with a fresh one. */
export async function authRequest<T>(path: string, init: Omit<ApiRequest, "accessToken"> = {}): Promise<T> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new ApiError("Your session has ended. Please sign in again.", 401);
  try {
    return await apiRequest<T>(path, { ...init, accessToken });
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err;
    const fresh = await refreshSession();
    if (!fresh) throw err;
    return apiRequest<T>(path, { ...init, accessToken: fresh });
  }
}
