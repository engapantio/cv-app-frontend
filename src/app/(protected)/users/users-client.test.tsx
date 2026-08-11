import { render, screen } from "@testing-library/react";
import UsersClient from "./users-client";
import { useUsersPage } from "@/features/users/hooks/use-users-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/features/users/hooks/use-users-page", () => ({ useUsersPage: jest.fn() }));
jest.mock("@/features/users/components/users-table", () => ({
  UsersTable: () => <div data-testid="users-table" />,
}));
jest.mock("@/components/shared/table-page-layout", () => ({
  TablePageLayout: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

const mockUseUsersPage = useUsersPage as unknown as jest.Mock;

const users = [
  {
    id: "u1",
    created_at: "",
    email: "a@b.com",
    is_verified: true,
    role: "Employee" as const,
    department_name: null,
    position_name: null,
    profile: {
      id: "p1",
      created_at: "",
      first_name: "A",
      last_name: null,
      full_name: "A",
      avatar: null,
    },
    department: null,
    position: null,
    cvs: [],
  },
];

const defaultTableData = {
  table: { getRowModel: () => ({ rows: [] }) },
  loading: false,
  isAdmin: false,
  columnCount: 5,
  currentUserId: null,
  createOpen: false,
  setCreateOpen: jest.fn(),
  updateTarget: null,
  setUpdateTarget: jest.fn(),
  deleteTarget: null,
  setDeleteTarget: jest.fn(),
  handleCreated: jest.fn(),
  handleUpdated: jest.fn(),
  handleDeleted: jest.fn(),
  globalFilter: "",
  setGlobalFilter: jest.fn(),
  departments: [],
  positions: [],
  creating: false,
  updating: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseUsersPage.mockReturnValue(defaultTableData);
});

describe("UsersClient", () => {
  it("renders the title and the users table", () => {
    render(
      <UsersClient
        initialUsers={users}
        serverError={null}
        initialUserId="u1"
        initialIsAdmin={false}
      />,
    );
    expect(screen.getByText("employees")).toBeInTheDocument();
    expect(screen.getByTestId("users-table")).toBeInTheDocument();
  });

  it("passes props to useUsersPage", () => {
    render(
      <UsersClient
        initialUsers={users}
        serverError={null}
        initialUserId="u1"
        initialIsAdmin={true}
      />,
    );
    expect(mockUseUsersPage).toHaveBeenCalledWith(users, "u1", true);
  });

  it("forwards the server error to the table", () => {
    mockUseUsersPage.mockReturnValue({ ...defaultTableData, serverError: "Server error" });
    render(
      <UsersClient
        initialUsers={users}
        serverError="Server error"
        initialUserId="u1"
        initialIsAdmin={false}
      />,
    );
    expect(screen.getByTestId("users-table")).toBeInTheDocument();
  });
});
