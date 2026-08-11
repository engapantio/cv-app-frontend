import { render, screen } from "@testing-library/react";
import LanguagesPage from "./page";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { notFound } from "next/navigation";

jest.mock("@/lib/apollo/server-client", () => ({ createServerApolloClientForRequest: jest.fn() }));
jest.mock("@/features/user-languages/components/user-languages-client", () => ({
  UserLanguagesClient: () => <div data-testid="user-languages-client" />,
}));
jest.mock("next/navigation", () => ({ notFound: jest.fn() }));

const mockCreateClient = createServerApolloClientForRequest as unknown as jest.Mock;
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
    languages: [{ name: "English", proficiency: "C1" as const }],
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
});

describe("LanguagesPage", () => {
  it("renders the languages client when authenticated and user exists", async () => {
    render(await LanguagesPage({ params: Promise.resolve({ userId: "u1" }) }));
    expect(screen.getByTestId("user-languages-client")).toBeInTheDocument();
  });

  it("calls notFound when there is no token", async () => {
    mockCreateClient.mockResolvedValue({ client: {}, accessToken: null });
    render(await LanguagesPage({ params: Promise.resolve({ userId: "u1" }) }));
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("calls notFound when the user is not found", async () => {
    mockCreateClient.mockResolvedValue({
      client: { query: jest.fn().mockResolvedValue({ data: { user: null } }) },
      accessToken: "token",
    });
    render(await LanguagesPage({ params: Promise.resolve({ userId: "u2" }) }));
    expect(mockNotFound).toHaveBeenCalled();
  });
});
