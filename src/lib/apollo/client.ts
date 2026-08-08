"use client";

import { ApolloLink, HttpLink, Observable } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { typePolicies } from "@/lib/apollo/cache";
import { GRAPHQL_PROXY_PATH } from "@/lib/apollo/endpoint";
import { getAccessToken, setTokens, isTokenExpired, clearTokens } from "@/lib/auth/token-store";

const AUTH_ERROR_PATTERN = /unauthorized|forbidden|expired/i;

function isAuthErrorMessage(message: string): boolean {
  return AUTH_ERROR_PATTERN.test(message);
}

function extractGraphQLErrors(error: unknown): Array<{ message: string }> | null {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.map(({ message }) => ({ message }));
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "graphQLErrors" in error &&
    Array.isArray((error as { graphQLErrors?: unknown }).graphQLErrors)
  ) {
    return (error as { graphQLErrors: Array<{ message: string }> }).graphQLErrors;
  }
  return null;
}

function isAuthErrorFromErrors(errors: Array<{ message: string }> | null | undefined): boolean {
  return errors?.some(({ message }) => isAuthErrorMessage(message)) ?? false;
}

function logGraphQLErrors(operationName: string | undefined, errors: Array<{ message: string }>) {
  for (const { message } of errors) {
    console.error(`[GraphQL error] ${operationName}: ${message}`);
  }
}

function logOperationError(operationName: string | undefined, error: unknown) {
  const graphQLErrors = extractGraphQLErrors(error);
  if (graphQLErrors) {
    logGraphQLErrors(operationName, graphQLErrors);
  } else {
    console.error(`[Network error] ${operationName}:`, error);
  }
}

let refreshPromise: Promise<void> | null = null;
let refreshFailed = false;

function isRefreshing(): boolean {
  return refreshPromise !== null;
}

function waitForRefresh(): Promise<void> | null {
  return refreshPromise;
}

async function refreshAuthSession(): Promise<void> {
  if (refreshFailed) {
    throw new Error("Session refresh previously failed");
  }

  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (res.status === 401) {
          clearTokens();
          refreshFailed = true;
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- non-component module (ApolloLink), not in React render context, so useRouter()/redirect() are unavailable; a full page reload is intentional to reset client state after session expiry
          window.location.href = "/auth/login";
          throw new Error("Refresh token expired");
        }
        if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
        const body = await res.json();
        if (body.accessToken) {
          setTokens(body.accessToken, body.refreshToken ?? null);
        }
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function resetFailedFlag() {
  refreshFailed = false;
}

const authLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    let innerSubscription: { unsubscribe: () => void } | null = null;

    const execute = (retriesLeft: number) => {
      resetFailedFlag();

      (async () => {
        try {
          const token = getAccessToken();

          if (token && isTokenExpired(token)) {
            try {
              if (isRefreshing()) {
                await waitForRefresh();
              } else {
                await refreshAuthSession();
              }
            } catch {
              // pre-request refresh failed; continue with stale token or none
            }
          }

          const freshToken = getAccessToken();
          operation.setContext(({ headers = {}, fetchOptions = {} }) => ({
            fetchOptions: { ...fetchOptions, cache: "no-store" },
            headers: {
              ...headers,
              ...(freshToken ? { Authorization: `Bearer ${freshToken}` } : {}),
            },
          }));

          if (innerSubscription) {
            innerSubscription.unsubscribe();
          }
          innerSubscription = forward(operation).subscribe({
            next(value) {
              const response = value as {
                data?: unknown;
                errors?: Array<{ message: string }>;
              };
              const errors = response.errors ?? null;
              const isAuthError = isAuthErrorFromErrors(errors);

              if (isAuthError && retriesLeft > 0) {
                const doRetry = () => {
                  execute(retriesLeft - 1);
                };
                if (isRefreshing()) {
                  waitForRefresh()
                    ?.then(doRetry)
                    .catch(() => {
                      if (errors) logGraphQLErrors(operation.operationName, errors);
                      observer.next(value);
                    });
                } else {
                  refreshAuthSession()
                    .then(() => {
                      resetFailedFlag();
                      doRetry();
                    })
                    .catch(() => {
                      if (errors) logGraphQLErrors(operation.operationName, errors);
                      observer.next(value);
                    });
                }
                return;
              }

              if (errors && errors.length > 0) {
                logGraphQLErrors(operation.operationName, errors);
              }
              observer.next(value);
            },
            error(err) {
              if (retriesLeft > 0) {
                const graphQLErrors = extractGraphQLErrors(err);
                const isAuthError =
                  isAuthErrorFromErrors(graphQLErrors) ?? isAuthErrorMessage(err?.message ?? "");

                if (isAuthError) {
                  if (isRefreshing()) {
                    waitForRefresh()
                      ?.then(() => {
                        resetFailedFlag();
                        execute(retriesLeft - 1);
                      })
                      .catch(() => {
                        logOperationError(operation.operationName, err);
                        observer.error(err);
                      });
                  } else {
                    refreshAuthSession()
                      .then(() => {
                        resetFailedFlag();
                        execute(retriesLeft - 1);
                      })
                      .catch(() => {
                        logOperationError(operation.operationName, err);
                        observer.error(err);
                      });
                  }
                  return;
                }
              }
              logOperationError(operation.operationName, err);
              observer.error(err);
            },
            complete() {
              observer.complete();
            },
          });
        } catch (err) {
          logOperationError(operation.operationName, err);
          observer.error(err);
        }
      })().catch(() => {
        // async IIFE rejection already handled by catch block above
      });
    };

    execute(1);

    return () => {
      innerSubscription?.unsubscribe();
    };
  });
});

export function createBrowserApolloClient() {
  const httpLink = new HttpLink({
    uri: GRAPHQL_PROXY_PATH,
    credentials: "include",
    fetchOptions: { cache: "no-store" },
  });

  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies,
    }),
    link: authLink.concat(httpLink),
  });
}
