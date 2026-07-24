"use client";

import { ApolloLink, HttpLink, Observable } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { typePolicies } from "@/lib/apollo/cache";
import { getAccessToken, setTokens, isTokenExpired } from "@/lib/auth/token-store";

let refreshPromise: Promise<void> | null = null;

async function refreshAuthSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
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

const authLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const execute = (retriesLeft: number) => {
      (async () => {
        try {
          const token = getAccessToken();

          if (token && isTokenExpired(token)) {
            try {
              await refreshAuthSession();
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

          forward(operation).subscribe({
            next(value) {
              observer.next(value);
            },
            error(err) {
              if (retriesLeft > 0) {
                const graphQLErrors =
                  CombinedGraphQLErrors.is(err)
                    ? err.errors
                    : "graphQLErrors" in err
                      ? (err as { graphQLErrors: Array<{ message: string }> }).graphQLErrors
                      : null;
                const isAuthError =
                  graphQLErrors?.some(({ message }: { message: string }) =>
                    /unauthorized|forbidden|expired/i.test(message),
                  ) ?? /unauthorized|forbidden|expired/i.test(err?.message ?? "");

                if (isAuthError) {
                  refreshAuthSession()
                    .then(() => execute(retriesLeft - 1))
                    .catch(() => observer.error(err));
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
      })();
    };

    execute(1);
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
