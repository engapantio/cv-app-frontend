import { render, screen } from "@testing-library/react";
import { UserLayoutClient } from "./user-layout-client";
import { useQuery } from "@apollo/client/react";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn() }));
jest.mock("@/features/user-profile/ui/user-profile-breadcrumb", () => ({
  UserProfileBreadcrumb: (props: { userName: string; tabLabel?: string }) => (
    <div data-testid="breadcrumb" data-name={props.userName} data-tab={props.tabLabel ?? ""} />
  ),
}));
jest.mock("@/features/user-profile/ui/user-profile-tabs", () => ({
  UserProfileTabs: () => <div data-testid="tabs" />,
}));

const mockUseQuery = useQuery as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseQuery.mockReturnValue({ data: undefined });
});

describe("UserLayoutClient", () => {
  it("renders the breadcrumb with the initial user name when query is not loaded", () => {
    render(
      <UserLayoutClient userId="u1" userName="Alice">
        <div>content</div>
      </UserLayoutClient>,
    );
    expect(screen.getByTestId("breadcrumb")).toHaveAttribute("data-name", "Alice");
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("uses the live user name from the query when available", () => {
    mockUseQuery.mockReturnValue({
      data: { user: { profile: { full_name: "Alice Smith" } } },
    });
    render(
      <UserLayoutClient userId="u1" userName="Alice">
        <div>content</div>
      </UserLayoutClient>,
    );
    expect(screen.getByTestId("breadcrumb")).toHaveAttribute("data-name", "Alice Smith");
  });

  it("calls useQuery with the correct variables", () => {
    render(
      <UserLayoutClient userId="u1" userName="Alice">
        <div>content</div>
      </UserLayoutClient>,
    );
    expect(mockUseQuery).toHaveBeenCalledWith(expect.anything(), {
      variables: { userId: "u1" },
    });
  });
});
