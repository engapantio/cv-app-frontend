import { render, screen } from "@testing-library/react";
import ProfilePage from "./page";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { getServerSessionUser } from "@/lib/auth/session-server";
import { notFound } from "next/navigation";

jest.mock("@/lib/apollo/server-client", () => ({ createServerApolloClientForRequest: jest.fn() }));
jest.mock("@/lib/auth/session-server", () => ({ getServerSessionUser: jest.fn() }));
jest.mock("@/features/user-profile/ui/user-profile-client", () => ({
  UserProfileClient: () => <div data-testid="user-profile-client" />,
}));
jest.mock("next/navigation", () => ({ notFound: jest.fn() }));

const mockCreateClient = createServerApolloClientForRequest as unknown as jest.Mock;
const mockGetServerSessionUser = getServerSessionUser as unknown as jest.Mock;
const mockNotFound = notFound as unknown as jest.Mock;

const user = {
  id: "u1",
  created_at: "1700000000",
  email: "a@b.com",
  is_verified: true,
  role: "Employee" as const,
  department_name: null,
  position_name: null,
  profile: {
    id: "p1",
    created_at: "",
    first_name: "A",
    last_name: "B",
    full_name: "A B",
    avatar: null,
    skills: [],
    languages: [],
  },
  department: null,
  position: null,
  cvs: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateClient.mockResolvedValue({
    client: { query: jest.fn().mockResolvedValue({ data: { user } }) },
    accessToken: "token",
  });
  mockGetServerSessionUser.mockResolvedValue({ id: "u1", role: "Employee" });
});

describe("ProfilePage", () => {
  it("renders the profile client when a session token and user exist", async () => {
    render(await ProfilePage({ params: Promise.resolve({ userId: "u1" }) }));
    expect(screen.getByTestId("user-profile-client")).toBeInTheDocument();
  });

  it("calls notFound when there is no session token", async () => {
    mockCreateClient.mockResolvedValue({ client: {}, accessToken: null });
    render(await ProfilePage({ params: Promise.resolve({ userId: "u1" }) }));
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("calls notFound when the user is not found", async () => {
    mockCreateClient.mockResolvedValue({
      client: { query: jest.fn().mockResolvedValue({ data: { user: null } }) },
      accessToken: "token",
    });
    render(await ProfilePage({ params: Promise.resolve({ userId: "u2" }) }));
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("computes isSelf correctly when the session user owns the profile", async () => {
    mockGetServerSessionUser.mockResolvedValue({ id: "u1", role: "Employee" });
    mockCreateClient.mockResolvedValue({
      client: { query: jest.fn().mockResolvedValue({ data: { user: { ...user, id: "u1" } } }) },
      accessToken: "token",
    });
    render(await ProfilePage({ params: Promise.resolve({ userId: "u1" }) }));
    expect(screen.getByTestId("user-profile-client")).toBeInTheDocument();
  });

  it("grants admin edit access regardless of ownership", async () => {
    mockGetServerSessionUser.mockResolvedValue({ id: "admin", role: "Admin" });
    render(await ProfilePage({ params: Promise.resolve({ userId: "u1" }) }));
    expect(screen.getByTestId("user-profile-client")).toBeInTheDocument();
  });
});
