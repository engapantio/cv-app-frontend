import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { typePolicies } from "@/lib/apollo/cache";
import { getServerAccessToken, getServerRefreshToken } from "@/lib/auth/cookies";
import { UpdateTokenDocument } from "@/gql/generated/graphql";

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

const EXPIRY_BUFFER_SECONDS = 30;

function isAccessTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return (payload.exp ?? 0) * 1000 - EXPIRY_BUFFER_SECONDS * 1000 < Date.now();
  } catch {
    return true;
  }
}

async function rotateAccessToken(refreshToken: string): Promise<string | null> {
  const client = createServerApolloClient(refreshToken);
  const { data } = await client.mutate({
    mutation: UpdateTokenDocument,
  });
  return data?.updateToken?.access_token ?? null;
}

export async function createServerApolloClientForRequest(): Promise<{
  client: ApolloClient;
  accessToken: string | null;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    getServerAccessToken(),
    getServerRefreshToken(),
  ]);

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return { client: createServerApolloClient(accessToken), accessToken };
  }

  if (refreshToken) {
    try {
      const rotated = await rotateAccessToken(refreshToken);
      if (rotated) {
        console.info("[server-auth] rotated access token for SSR request");
        return { client: createServerApolloClient(rotated), accessToken: rotated };
      }
    } catch {
      // refresh failed; fall back to forwarding whatever token is available
    }
  }

  return { client: createServerApolloClient(accessToken ?? undefined), accessToken };
}
