import { redirect } from "next/navigation";
import RootPage from "./page";
import { getServerAccessToken } from "@/lib/auth/cookies";

jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
jest.mock("@/lib/auth/cookies", () => ({ getServerAccessToken: jest.fn() }));

const mockRedirect = redirect as unknown as jest.Mock;
const mockGetServerAccessToken = getServerAccessToken as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockRedirect.mockImplementation(() => {
    throw new Error("redirect");
  });
});

describe("RootPage", () => {
  it("redirects to /users when a token exists", async () => {
    mockGetServerAccessToken.mockResolvedValue("token");
    await expect(RootPage()).rejects.toThrow("redirect");
    expect(mockRedirect).toHaveBeenCalledWith("/users");
  });

  it("redirects to /auth/login when there is no token", async () => {
    mockGetServerAccessToken.mockResolvedValue(null);
    await expect(RootPage()).rejects.toThrow("redirect");
    expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
  });
});
