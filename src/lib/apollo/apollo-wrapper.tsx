"use client";

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import { createBrowserApolloClient } from "@/lib/apollo/client";

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={createBrowserApolloClient}>{children}</ApolloNextAppProvider>
  );
}
