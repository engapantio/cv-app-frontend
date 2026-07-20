"use client";

import { HttpLink, Observable } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { ErrorLink } from "@apollo/client/link/error";
import { SetContextLink } from "@apollo/client/link/context";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { typePolicies } from "@/lib/apollo/cache";
// import { clearSession } from "@/lib/auth/session";

// let isLoggingOut = false;
let refreshPromise: Promise<void> | null = null;

async function refreshAuthSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

const authLink = new SetContextLink((prevContext) => ({
  ...prevContext,
  fetchOptions: {
    ...(prevContext.fetchOptions ?? {}),
    cache: "no-store",
  },
}));

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!CombinedGraphQLErrors.is(error)) {
    console.error(`[Network error] ${operation.operationName}:`, error);
    return;
  }
  const unauthorized = error.errors.some(({ message }) =>
    /unauthorized|forbidden|expired/i.test(message),
  );

  for (const { message } of error.errors) {
    console.error(`[GraphQL error] ${operation.operationName}: ${message}`);
  }

  if (!unauthorized || !forward) return;

  return new Observable((observer) => {
    let sub: { unsubscribe(): void } | null = null;
    let cancelled = false;

    (async () => {
      try {
        await refreshAuthSession();
        if (cancelled) return;

        sub = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      } catch (err) {
        if (!cancelled) observer.error(err);
      }
    })();

    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
  });
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
    link: authLink.concat(errorLink, httpLink),
  });
}
