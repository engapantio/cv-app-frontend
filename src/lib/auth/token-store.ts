let accessToken: string | null = null;
let refreshToken: string | null = null;

let bootstrapResolve: (() => void) | null = null;
export const onBootstrapComplete: Promise<void> = new Promise((resolve) => {
  bootstrapResolve = resolve;
});

export function resolveBootstrap() {
  bootstrapResolve?.();
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access;
  refreshToken = refresh;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
}

const EXPIRY_BUFFER_SECONDS = 30;

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (payload.exp ?? 0) * 1000 - EXPIRY_BUFFER_SECONDS * 1000 < Date.now();
  } catch {
    return true;
  }
}
