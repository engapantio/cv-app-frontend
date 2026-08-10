import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useUsersPage, type CreateUserPayload } from "./use-users-page";
import { DuplicateEmailError } from "@/features/users/errors";
import type { UserItem } from "@/features/users/types";

jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn(), useMutation: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui/avatar", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/dropdown-menu", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared/row-actions", () => require("@/test-utils/mocks").mockRowActions());
jest.mock("@/components/shared/sortable-header", () =>
  require("@/test-utils/mocks").mockSortableHeader(),
);
jest.mock("@/lib/auth/permissions", () => ({
  usePermissions: () => ({ isAdmin: true, currentUserId: "u1" }),
}));

const mockToastSuccess = jest.fn();
const mockToastWarning = jest.fn();
const mockToastError = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    warning: (...args: unknown[]) => mockToastWarning(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseMutation = useMutation as unknown as jest.Mock;

const payload: CreateUserPayload = {
  email: "new@example.com",
  password: "Password123",
  first_name: "New",
  last_name: "User",
  departmentId: null,
  positionId: null,
  role: "Employee",
};

const createUserResult = {
  data: { createUser: { id: "42", created_at: "", email: "new@example.com", is_verified: false } },
};

const createUserVariables = {
  variables: {
    user: {
      auth: { email: "new@example.com", password: "Password123" },
      profile: { first_name: "New", last_name: "User" },
      cvsIds: [],
      departmentId: null,
      positionId: null,
      role: "Employee",
    },
  },
};

function queryResults() {
  return {
    data: { users: [], departments: [], positions: [] },
    loading: false,
    refetch: jest.fn().mockResolvedValue(undefined),
  };
}

function operationName(doc: unknown): string {
  return (
    (doc as { definitions?: Array<{ name?: { value?: string } }> }).definitions?.[0]?.name?.value ??
    ""
  );
}

let actionCreateUser: jest.Mock;
let actionDeleteUser: jest.Mock;
let actionSendVerificationEmail: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseQuery.mockReturnValue(queryResults());
  actionCreateUser = jest.fn();
  actionDeleteUser = jest.fn();
  actionSendVerificationEmail = jest.fn();
  mockUseMutation.mockImplementation((doc: unknown) => {
    const name = operationName(doc);
    if (name === "SendVerificationEmail") return [actionSendVerificationEmail, { loading: false }];
    if (name === "CreateUser") return [actionCreateUser, { loading: false }];
    return [actionDeleteUser, { loading: false }];
  });
});

describe("useUsersPage create orchestration", () => {
  it("dispatches the verification email after a successful user creation", async () => {
    actionCreateUser.mockResolvedValue(createUserResult);
    actionSendVerificationEmail.mockResolvedValue({ data: { sendVerificationEmail: null } });

    const { result } = renderHook(() => useUsersPage([]));
    await act(async () => {
      await result.current.handleCreated(payload);
    });

    expect(actionCreateUser).toHaveBeenCalledWith(createUserVariables);
    await waitFor(() =>
      expect(actionSendVerificationEmail).toHaveBeenCalledWith({
        variables: { email: "new@example.com" },
      }),
    );
    expect(mockToastSuccess).toHaveBeenCalledWith("userCreatedSuccess");
    expect(mockToastWarning).not.toHaveBeenCalled();
  });

  it("shows a non-blocking warning when the verification email dispatch fails", async () => {
    actionCreateUser.mockResolvedValue(createUserResult);
    actionSendVerificationEmail.mockRejectedValue(new Error("Failed to send email"));

    const { result } = renderHook(() => useUsersPage([]));
    await act(async () => {
      await result.current.handleCreated(payload);
    });

    expect(mockToastSuccess).toHaveBeenCalledWith("userCreatedSuccess");
    await waitFor(() => expect(mockToastWarning).toHaveBeenCalledWith("userCreatedEmailFailed"));
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("does not attempt the verification email when user creation fails", async () => {
    actionCreateUser.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useUsersPage([]));
    await act(async () => {
      await expect(result.current.handleCreated(payload)).rejects.toThrow("network error");
    });

    expect(actionSendVerificationEmail).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it("throws a DuplicateEmailError when the backend rejects a duplicate email", async () => {
    actionCreateUser.mockRejectedValue({
      graphQLErrors: [{ message: "duplicate key value violates unique constraint" }],
    });

    const { result } = renderHook(() => useUsersPage([]));
    await act(async () => {
      await expect(result.current.handleCreated(payload)).rejects.toBeInstanceOf(
        DuplicateEmailError,
      );
    });

    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("shows the newly created user in the list right after creation (no reload)", async () => {
    let users = [] as UserItem[];
    const createdUser = {
      id: "9999",
      created_at: new Date().toISOString(),
      email: "new@example.com",
      is_verified: false,
      role: "Employee",
    } as unknown as UserItem;
    const refetch = jest.fn(async () => {
      users = [createdUser, ...users];
    });
    mockUseQuery.mockImplementation(() => ({
      data: { users, departments: [], positions: [] },
      loading: false,
      refetch,
    }));
    actionCreateUser.mockResolvedValue(createUserResult);
    actionSendVerificationEmail.mockResolvedValue({ data: { sendVerificationEmail: null } });

    const { result } = renderHook(() => useUsersPage([]));

    expect(result.current.table.getRowModel().rows).toHaveLength(0);

    await act(async () => {
      await result.current.handleCreated(payload);
    });

    await waitFor(() => {
      const emails = result.current.table.getRowModel().rows.map((r) => r.original.email);
      expect(emails).toContain("new@example.com");
    });
    expect(result.current.table.getState().pagination.pageIndex).toBe(0);
  });
});
