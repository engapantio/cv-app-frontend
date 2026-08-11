import { render, screen } from "@testing-library/react";
import { UserProfileClient } from "./user-profile-client";
import { useQuery } from "@apollo/client/react";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn() }));
jest.mock("./avatar-upload", () => ({
  AvatarUpload: () => <div data-testid="avatar-upload" />,
}));
jest.mock("./profile-form", () => ({
  ProfileForm: () => <div data-testid="profile-form" />,
}));
jest.mock("@/components/shared", () => ({
  VerifiedBadge: ({ verified }: { verified: boolean }) => (
    <span data-testid="verified-badge">{String(verified)}</span>
  ),
}));

const mockUseQuery = useQuery as unknown as jest.Mock;

const baseUser = {
  id: "u1",
  created_at: "1700000000",
  email: "alice@example.com",
  is_verified: true,
  role: "Employee" as const,
  department_name: "Engineering",
  position_name: "Engineer",
  profile: {
    id: "p1",
    created_at: "",
    first_name: "Alice",
    last_name: "Smith",
    full_name: "Alice Smith",
    avatar: null,
    skills: [],
    languages: [],
  },
  department: { id: "d1", created_at: "", name: "Engineering" },
  position: { id: "pos1", created_at: "", name: "Engineer" },
  cvs: [],
};

function renderClient({
  canEdit = true,
  isSelf = true,
}: {
  canEdit?: boolean;
  isSelf?: boolean;
} = {}) {
  return render(<UserProfileClient user={baseUser} canEdit={canEdit} isSelf={isSelf} />);
}

describe("UserProfileClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: undefined });
  });

  it("renders the profile details from the initial user when the query has no data", () => {
    renderClient();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("verified-badge")).toHaveTextContent("true");
    expect(screen.getByTestId("avatar-upload")).toBeInTheDocument();
    expect(screen.getByTestId("profile-form")).toBeInTheDocument();
  });

  it("prefers the queried user over the initial one", () => {
    mockUseQuery.mockReturnValue({
      data: { user: { ...baseUser, profile: { ...baseUser.profile, full_name: "Fresh Name" } } },
    });
    renderClient();
    expect(screen.getByText("Fresh Name")).toBeInTheDocument();
  });

  it("shows the placeholder icon when the user has no full name", () => {
    mockUseQuery.mockReturnValue({
      data: {
        user: {
          ...baseUser,
          profile: { ...baseUser.profile, first_name: null, last_name: null, full_name: null },
        },
      },
    });
    renderClient();
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
  });

  it("renders the not available label for an invalid member since date", () => {
    mockUseQuery.mockReturnValue({
      data: { user: { ...baseUser, created_at: "not-a-number" } },
    });
    renderClient();
    expect(screen.getByText("memberSince")).toBeInTheDocument();
  });
});
