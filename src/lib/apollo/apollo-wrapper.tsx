"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { clearSession } from "@/lib/auth/session";

const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    const unauthorized = error.errors.some(({ message }) =>
      /unauthorized|forbidden|expired/i.test(message),
    );

    for (const { message } of error.errors) {
      console.error(`[GraphQL error] ${operation.operationName}: ${message}`);
    }

    if (unauthorized) {
      fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).finally(() => {
        clearSession();
        if (window.location.pathname !== "/auth/login") {
          window.location.assign("/auth/login");
        }
      });
    }
  } else {
    console.error(`[Network error] ${operation.operationName}:`, error);
  }
});

function makeClient() {
  const httpLink = new HttpLink({
    uri: "/api/graphql",
    credentials: "include",
    fetchOptions: { cache: "no-store" },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: errorLink.concat(httpLink),
  });
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
