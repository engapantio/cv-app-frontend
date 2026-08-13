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
  data: { createUser: { id: "42", created_at: "", email: "new@example.com", is_verified: false, role: "Employee" } },
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
let actionUpdateProfile: jest.Mock;
let actionUpdateUser: jest.Mock;
let actionDeleteUser: jest.Mock;
let actionSendVerificationEmail: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseQuery.mockReturnValue(queryResults());
  actionCreateUser = jest.fn();
  actionUpdateProfile = jest.fn();
  actionUpdateUser = jest.fn();
  actionDeleteUser = jest.fn();
  actionSendVerificationEmail = jest.fn();
  mockUseMutation.mockImplementation((doc: unknown) => {
    const name = operationName(doc);
    if (name === "SendVerificationEmail") return [actionSendVerificationEmail, { loading: false }];
    if (name === "CreateUser") return [actionCreateUser, { loading: false }];
    if (name === "UpdateProfile") return [actionUpdateProfile, { loading: false }];
    if (name === "UpdateUser") return [actionUpdateUser, { loading: false }];
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

  it("closes the create dialog as soon as creation succeeds", async () => {
    const users = [] as UserItem[];
    mockUseQuery.mockImplementation(() => ({
      data: { users, departments: [], positions: [] },
      loading: false,
      refetch: jest.fn(),
    }));
    actionCreateUser.mockResolvedValue(createUserResult);
    actionSendVerificationEmail.mockResolvedValue({ data: { sendVerificationEmail: null } });

    const { result } = renderHook(() => useUsersPage([]));
    act(() => result.current.setCreateOpen(true));
    expect(result.current.createOpen).toBe(true);

    await act(async () => {
      await result.current.handleCreated(payload);
    });

    expect(result.current.createOpen).toBe(false);
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
    const stableQueryResult = {
      data: { users, departments: [], positions: [] },
      loading: false,
      refetch,
    };
    mockUseQuery.mockImplementation(() => stableQueryResult);
    actionCreateUser.mockResolvedValue(createUserResult);
    actionSendVerificationEmail.mockResolvedValue({ data: { sendVerificationEmail: null } });

    const { result } = renderHook(() => useUsersPage([]));

    expect(result.current.table.getRowModel().rows).toHaveLength(0);

    await act(async () => {
      await result.current.handleCreated(payload);
    });

    expect(actionCreateUser).toHaveBeenCalled();

    await waitFor(() => {
      const emails = result.current.table.getRowModel().rows.map((r) => r.original.email);
      expect(emails).toContain("new@example.com");
    });
    expect(result.current.table.getState().pagination.pageIndex).toBe(0);
  });
});

const updateTarget = {
  id: "u1",
  created_at: "2024-01-01T00:00:00Z",
  email: "alice@example.com",
  is_verified: true,
  role: "Employee",
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
  department: { id: "d1", created_at: "", name: "Engineering" },
  position: { id: "pos1", created_at: "", name: "Engineer" },
  cvs: [],
} as unknown as UserItem;

const unchangedPayload = {
  userId: "u1",
  first_name: "Alice",
  last_name: "Smith",
  departmentId: "d1",
  positionId: "pos1",
  role: "Employee" as const,
};

describe("useUsersPage update orchestration", () => {
  it("routes first name changes to updateProfile only", async () => {
    actionUpdateProfile.mockResolvedValue({ data: { updateProfile: { id: "p1" } } });

    const { result } = renderHook(() => useUsersPage([], "u1", false));
    await act(async () => {
      result.current.setUpdateTarget(updateTarget);
    });
    await act(async () => {
      await result.current.handleUpdated({
        ...unchangedPayload,
        first_name: "Alicia",
      });
    });

    expect(actionUpdateProfile).toHaveBeenCalledWith({
      variables: { profile: { userId: "u1", first_name: "Alicia", last_name: "Smith" } },
    });
    expect(actionUpdateUser).not.toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith("userUpdatedSuccess");
  });

  it("routes role changes to updateUser only", async () => {
    actionUpdateUser.mockResolvedValue({ data: { updateUser: { id: "u1" } } });

    const { result } = renderHook(() => useUsersPage([], "u1", false));
    await act(async () => {
      result.current.setUpdateTarget(updateTarget);
    });
    await act(async () => {
      await result.current.handleUpdated({ ...unchangedPayload, role: "Admin" });
    });

    expect(actionUpdateUser).toHaveBeenCalledWith({
      variables: {
        user: { userId: "u1", departmentId: "d1", positionId: "pos1", role: "Admin" },
      },
    });
    expect(actionUpdateProfile).not.toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith("userUpdatedSuccess");
  });

  it("routes department changes to updateUser only", async () => {
    actionUpdateUser.mockResolvedValue({ data: { updateUser: { id: "u1" } } });

    const { result } = renderHook(() => useUsersPage([], "u1", false));
    await act(async () => {
      result.current.setUpdateTarget(updateTarget);
    });
    await act(async () => {
      await result.current.handleUpdated({ ...unchangedPayload, departmentId: null });
    });

    expect(actionUpdateUser).toHaveBeenCalledWith({
      variables: { user: { userId: "u1", departmentId: "", positionId: "pos1" } },
    });
    expect(actionUpdateProfile).not.toHaveBeenCalled();
  });

  it("fires both updateProfile and updateUser when both groups change", async () => {
    actionUpdateProfile.mockResolvedValue({ data: { updateProfile: { id: "p1" } } });
    actionUpdateUser.mockResolvedValue({ data: { updateUser: { id: "u1" } } });

    const { result } = renderHook(() => useUsersPage([], "u1", false));
    await act(async () => {
      result.current.setUpdateTarget(updateTarget);
    });
    await act(async () => {
      await result.current.handleUpdated({
        ...unchangedPayload,
        first_name: "Alicia",
        role: "Admin",
      });
    });

    expect(actionUpdateProfile).toHaveBeenCalledWith({
      variables: { profile: { userId: "u1", first_name: "Alicia", last_name: "Smith" } },
    });
    expect(actionUpdateUser).toHaveBeenCalledWith({
      variables: {
        user: { userId: "u1", departmentId: "d1", positionId: "pos1", role: "Admin" },
      },
    });
    expect(mockToastSuccess).toHaveBeenCalledWith("userUpdatedSuccess");
    expect(mockToastWarning).not.toHaveBeenCalled();
  });

  it("waits for updateProfile to settle before firing updateUser (sequential)", async () => {
    let resolveProfile: (value: unknown) => void;
    const profilePromise = new Promise((resolve) => {
      resolveProfile = resolve;
    });
    actionUpdateProfile.mockImplementation(() => profilePromise);
    actionUpdateUser.mockResolvedValue({ data: { updateUser: { id: "u1" } } });

    const { result } = renderHook(() => useUsersPage([], "u1", false));
    await act(async () => {
      result.current.setUpdateTarget(updateTarget);
    });

    let pending: Promise<void>;
    await act(async () => {
      pending = result.current.handleUpdated({
        ...unchangedPayload,
        first_name: "Alicia",
        role: "Admin",
      });
    });

    expect(actionUpdateProfile).toHaveBeenCalled();
    expect(actionUpdateUser).not.toHaveBeenCalled();

    await act(async () => {
      resolveProfile({ data: { updateProfile: { id: "p1" } } });
      await pending;
    });

    expect(actionUpdateUser).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith("userUpdatedSuccess");
  });

  it("shows a non-blocking partial-failure warning when one group fails", async () => {
    actionUpdateProfile.mockRejectedValue(new Error("profile update failed"));
    actionUpdateUser.mockResolvedValue({ data: { updateUser: { id: "u1" } } });

    const { result } = renderHook(() => useUsersPage([], "u1", false));
    await act(async () => {
      result.current.setUpdateTarget(updateTarget);
    });
    await act(async () => {
      await result.current.handleUpdated({
        ...unchangedPayload,
        first_name: "Alicia",
        role: "Admin",
      });
    });

    await waitFor(() => expect(mockToastWarning).toHaveBeenCalledWith("userUpdatePartial"));
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("shows an error toast and throws when every mutation fails", async () => {
    actionUpdateProfile.mockRejectedValue(new Error("profile update failed"));
    actionUpdateUser.mockRejectedValue(new Error("user update failed"));

    const { result } = renderHook(() => useUsersPage([], "u1", false));
    await act(async () => {
      result.current.setUpdateTarget(updateTarget);
    });
    await act(async () => {
      await expect(
        result.current.handleUpdated({ ...unchangedPayload, first_name: "Alicia", role: "Admin" }),
      ).rejects.toThrow("updateUserFailed");
    });

    expect(mockToastError).toHaveBeenCalledWith("updateUserFailed");
  });

  it("does not fire any mutation when no field changed", async () => {
    const { result } = renderHook(() => useUsersPage([], "u1", false));
    await act(async () => {
      result.current.setUpdateTarget(updateTarget);
    });
    await act(async () => {
      await result.current.handleUpdated(unchangedPayload);
    });

    expect(actionUpdateProfile).not.toHaveBeenCalled();
    expect(actionUpdateUser).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it("sets the update target when the Update action is invoked", async () => {
    const { result } = renderHook(() => useUsersPage([], "u1", false));
    await act(async () => {
      result.current.handleUpdate(updateTarget);
    });
    expect(result.current.updateTarget).toBe(updateTarget);
  });
});
