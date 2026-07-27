"use client";

import { ApolloLink, HttpLink, Observable } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { typePolicies } from "@/lib/apollo/cache";
import {
  getAccessToken,
  setTokens,
  isTokenExpired,
  clearTokens,
  onBootstrapComplete,
} from "@/lib/auth/token-store";

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
          let token = getAccessToken();

          if (!token) {
            await onBootstrapComplete;
            token = getAccessToken();
          }

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
              const response = value as { data?: unknown; errors?: Array<{ message: string }> };
              const isAuthError = response.errors?.some(({ message }) =>
                /unauthorized|forbidden|expired/i.test(message),
              );

              if (isAuthError && retriesLeft > 0) {
                const doRetry = () => {
                  execute(retriesLeft - 1);
                };
                if (isRefreshing()) {
                  waitForRefresh()
                    ?.then(doRetry)
                    .catch(() => observer.next(value));
                } else {
                  refreshAuthSession()
                    .then(() => {
                      resetFailedFlag();
                      doRetry();
                    })
                    .catch(() => observer.next(value));
                }
                return;
              }
              observer.next(value);
            },
            error(err) {
              if (retriesLeft > 0) {
                const graphQLErrors = CombinedGraphQLErrors.is(err)
                  ? err.errors
                  : "graphQLErrors" in err
                    ? (err as { graphQLErrors: Array<{ message: string }> }).graphQLErrors
                    : null;
                const isAuthError =
                  graphQLErrors?.some(({ message }: { message: string }) =>
                    /unauthorized|forbidden|expired/i.test(message),
                  ) ?? /unauthorized|forbidden|expired/i.test(err?.message ?? "");

                if (isAuthError) {
                  if (isRefreshing()) {
                    waitForRefresh()
                      ?.then(() => {
                        resetFailedFlag();
                        execute(retriesLeft - 1);
                      })
                      .catch(() => observer.error(err));
                  } else {
                    refreshAuthSession()
                      .then(() => {
                        resetFailedFlag();
                        execute(retriesLeft - 1);
                      })
                      .catch(() => observer.error(err));
                  }
                  return;
                }
              }
              observer.error(err);
            },
            complete() {
              observer.complete();
            },
          });
        } catch (err) {
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

const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const { message } of error.errors) {
      console.error(`[GraphQL error] ${operation.operationName}: ${message}`);
    }
  } else {
    console.error(`[Network error] ${operation.operationName}:`, error);
  }
});

function getGraphqlUri() {
  return "/api/graphql";
}

export function createBrowserApolloClient() {
  const httpLink = new HttpLink({
    uri: getGraphqlUri(),
    credentials: "include",
    fetchOptions: { cache: "no-store" },
  });

  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies,
    }),
    link: authLink.concat(errorLink.concat(httpLink)),
  });
}
