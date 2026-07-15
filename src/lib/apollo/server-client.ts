import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";

const GRAPHQL_URI = process.env.GRAPHQL_API_URL;
if (!GRAPHQL_URI) {
  throw new Error("GRAPHQL_API_URL is not set");
}

const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const { message } of error.errors) {
      console.error(`[GraphQL error] ${operation.operationName}: ${message}`);
    }
  } else {
    console.error(`[Network error] ${operation.operationName}:`, error);
  }
});

function createHttpLink(cookieHeader?: string) {
  return new HttpLink({
    uri: GRAPHQL_URI,
    fetchOptions: { cache: "no-store" },
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}

export function createServerApolloClient(cookieHeader?: string) {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: errorLink.concat(createHttpLink(cookieHeader)),
  });
}
