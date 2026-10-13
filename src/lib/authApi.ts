// Backend auth calls that run outside the sign-in form. Paths are relative to this app's /api/v1, which is
// expected to proxy to the backend (see next.config).

/**
 * POST /api/v1/auth/logout — revokes the refresh token so it can no longer mint access tokens. The backend
 * answers 200 even for an already-revoked token. Best effort: the local session is cleared regardless, so
 * a failure here never keeps anyone signed in.
 */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    await fetch("/api/v1/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      // Lets the request finish even when logout navigates away straight after.
      keepalive: true,
    });
  } catch {
    // Offline or backend down: the token simply expires on its own.
  }
}
