import { render, screen } from "@testing-library/react";
import UserSkillsPage from "./page";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { fetchSkillsCatalog } from "@/lib/apollo/initial-data";
import { notFound } from "next/navigation";

jest.mock("@/lib/apollo/server-client", () => ({ createServerApolloClientForRequest: jest.fn() }));
jest.mock("@/lib/apollo/initial-data", () => ({ fetchSkillsCatalog: jest.fn() }));
jest.mock("./user-skills-client", () => ({
  UserSkillsClient: () => <div data-testid="user-skills-client" />,
}));
jest.mock("next/navigation", () => ({ notFound: jest.fn() }));

const mockCreateClient = createServerApolloClientForRequest as unknown as jest.Mock;
const mockFetchSkillsCatalog = fetchSkillsCatalog as unknown as jest.Mock;
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
  mockFetchSkillsCatalog.mockResolvedValue({ skills: [], categories: [] });
});

describe("UserSkillsPage", () => {
  it("renders the skills client when authenticated and user exists", async () => {
    render(await UserSkillsPage({ params: Promise.resolve({ userId: "u1" }) }));
    expect(screen.getByTestId("user-skills-client")).toBeInTheDocument();
  });

  it("calls notFound when there is no token", async () => {
    mockCreateClient.mockResolvedValue({ client: {}, accessToken: null });
    render(await UserSkillsPage({ params: Promise.resolve({ userId: "u1" }) }));
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("calls notFound when the user is not found", async () => {
    mockCreateClient.mockResolvedValue({
      client: { query: jest.fn().mockResolvedValue({ data: { user: null } }) },
      accessToken: "token",
    });
    render(await UserSkillsPage({ params: Promise.resolve({ userId: "u2" }) }));
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("fetches the skills catalog", async () => {
    render(await UserSkillsPage({ params: Promise.resolve({ userId: "u1" }) }));
    expect(mockFetchSkillsCatalog).toHaveBeenCalled();
  });
});
