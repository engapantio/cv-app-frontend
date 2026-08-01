import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { typePolicies } from "@/lib/apollo/cache";

function getGraphqlUri() {
  const value = process.env.GRAPHQL_API_URL;

  if (!value) {
    throw new Error("GRAPHQL_API_URL is not set");
  }

  return value;
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

function createAuthLink(token?: string) {
  return new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }));

    return forward(operation);
  });
}

function createHttpLink(headers?: Record<string, string>) {
  return new HttpLink({
    uri: getGraphqlUri(),
    headers,
    fetchOptions: { cache: "no-store" },
  });
}

export function createServerApolloClient(token?: string, headers?: Record<string, string>) {
  return new ApolloClient({
    cache: new InMemoryCache({ typePolicies }),
    link: errorLink.concat(createAuthLink(token).concat(createHttpLink(headers))),
  });
}
