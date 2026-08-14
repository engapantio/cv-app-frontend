import { getServerSessionUser } from "./session-server";

const mockGetServerUserId = jest.fn();
jest.mock("@/lib/auth/cookies", () => ({
  getServerUserId: (...args: unknown[]) => mockGetServerUserId(...args),
}));

const mockCreateForRequest = jest.fn();
jest.mock("@/lib/apollo/server-client", () => ({
  createServerApolloClientForRequest: (...args: unknown[]) => mockCreateForRequest(...args),
}));

jest.mock("@/gql/generated/graphql", () => ({
  UserDocument: "UserDocument",
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getServerSessionUser", () => {
  it("returns null when there is no user id", async () => {
    mockGetServerUserId.mockResolvedValue(null);
    await expect(getServerSessionUser()).resolves.toBeNull();
    expect(mockCreateForRequest).not.toHaveBeenCalled();
  });

  it("returns the user from the query", async () => {
    mockGetServerUserId.mockResolvedValue("u1");
    const user = { id: "u1", email: "a@b.com" };
    mockCreateForRequest.mockResolvedValue({
      client: { query: jest.fn().mockResolvedValue({ data: { user } }) },
    });
    await expect(getServerSessionUser()).resolves.toEqual(user);
  });

  it("returns null when the query yields no user", async () => {
    mockGetServerUserId.mockResolvedValue("u1");
    mockCreateForRequest.mockResolvedValue({
      client: { query: jest.fn().mockResolvedValue({ data: { user: null } }) },
    });
    await expect(getServerSessionUser()).resolves.toBeNull();
  });

  it("returns null when the query throws", async () => {
    mockGetServerUserId.mockResolvedValue("u1");
    mockCreateForRequest.mockResolvedValue({
      client: { query: jest.fn().mockRejectedValue(new Error("boom")) },
    });
    await expect(getServerSessionUser()).resolves.toBeNull();
  });
});
