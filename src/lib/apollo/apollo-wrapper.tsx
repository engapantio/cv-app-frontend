// src/lib/apollo/apollo-wrapper.tsx
"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";

const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const { message } of error.errors) {
      console.error(`[GraphQL error] ${operation.operationName}: ${message}`);
    }
  } else {
    console.error(`[Network error] ${operation.operationName}:`, error);
  }
});

function makeClient() {
  const NEXT_PUBLIC_GRAPHQL_API_URL = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;
  if (!NEXT_PUBLIC_GRAPHQL_API_URL) {
    throw new Error("NEXT_PUBLIC_GRAPHQL_API_URL is not set");
  }
  const httpLink = new HttpLink({
    uri: NEXT_PUBLIC_GRAPHQL_API_URL,
    fetchOptions: { credentials: "include" },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: errorLink.concat(httpLink),
  });
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
