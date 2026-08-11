import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { UsersTable } from "./users-table";
import { createUsersColumns } from "../columns";
import type { UserItem } from "../types";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/input", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/dropdown-menu", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  AvatarImage: () => null,
  AvatarFallback: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/components/shared/row-actions", () => require("@/test-utils/mocks").mockRowActions());
jest.mock("@/components/shared/sortable-header", () =>
  require("@/test-utils/mocks").mockSortableHeader(),
);
jest.mock("@/components/shared/table-pagination", () =>
  require("@/test-utils/mocks").mockTablePagination(),
);

const baseUser = {
  created_at: "2024-01-01T00:00:00Z",
  is_verified: true,
  department_name: "Engineering",
  position_name: "Engineer",
  profile: {
    id: "p1",
    created_at: "2024-01-01T00:00:00Z",
    first_name: "Alice",
    last_name: "Smith",
    full_name: "Alice Smith",
    avatar: null,
  },
  cvs: [],
};

const users: UserItem[] = [
  {
    ...baseUser,
    id: "u1",
    email: "alice@example.com",
    role: "Employee",
    department: { id: "d1", created_at: "", name: "Engineering" },
    position: { id: "pos1", created_at: "", name: "Engineer" },
  },
  {
    ...baseUser,
    id: "u2",
    email: "bob@example.com",
    role: "Employee",
    department_name: null,
    position_name: null,
    department: null,
    position: null,
    profile: {
      ...baseUser.profile,
      first_name: "Bob",
      last_name: null,
      full_name: "Bob",
    },
  },
];

function renderTable({
  isAdmin = true,
  loading = false,
  data = users,
  serverError,
  currentUserId = "u1",
}: {
  isAdmin?: boolean;
  loading?: boolean;
  data?: UserItem[];
  serverError?: string | null;
  currentUserId?: string;
}) {
  const t = (key: string) => key.split(".").pop() ?? key;
  const actions = { onOpen: jest.fn(), onUpdate: jest.fn(), onDelete: jest.fn() };

  function Harness() {
    const [globalFilter, setGlobalFilter] = useState("");
    const columns = createUsersColumns(t, t, isAdmin, currentUserId, actions);
    const table = useReactTable({
      data,
      columns,
      state: { globalFilter },
      onGlobalFilterChange: setGlobalFilter,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });
    return (
      <UsersTable
        loading={loading}
        table={table}
        columnCount={columns.length}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        createOpen={false}
        setCreateOpen={jest.fn()}
        updateTarget={null}
        setUpdateTarget={jest.fn()}
        deleteTarget={null}
        setDeleteTarget={jest.fn()}
        handleCreated={jest.fn()}
        handleUpdated={jest.fn()}
        handleDeleted={jest.fn()}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        serverError={serverError}
        departments={[]}
        positions={[]}
        creating={false}
        updating={false}
      />
    );
  }
  const view = render(<Harness />);
  return { actions, view };
}

describe("UsersTable", () => {
  it("renders the sortable column headers", () => {
    renderTable({});
    expect(screen.getByText("firstName")).toBeInTheDocument();
    expect(screen.getByText("lastName")).toBeInTheDocument();
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("department")).toBeInTheDocument();
    expect(screen.getByText("position")).toBeInTheDocument();
  });

  it("renders each user row with its fields and avatar fallback", () => {
    renderTable({});
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows the create action for admins", () => {
    renderTable({ isAdmin: true });
    expect(screen.getByText("createUser")).toBeInTheDocument();
  });

  it("hides the create action for non-admins", () => {
    renderTable({ isAdmin: false });
    expect(screen.queryByText("createUser")).not.toBeInTheDocument();
  });

  it("filters rows as the search box is typed into", async () => {
    const user = userEvent.setup();
    renderTable({});
    await user.type(screen.getByPlaceholderText("search"), "bob");
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("alice@example.com")).not.toBeInTheDocument();
  });

  it("renders the empty state when there are no rows", () => {
    renderTable({ data: [] });
    expect(screen.getByText("noUsersFound")).toBeInTheDocument();
  });

  it("renders the loading message while loading", () => {
    renderTable({ data: [], loading: true });
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("renders the server error instead of rows", () => {
    renderTable({ serverError: "Failed to load users" });
    expect(screen.getByText("Failed to load users")).toBeInTheDocument();
  });
});
