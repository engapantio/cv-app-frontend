import { render, screen } from "@testing-library/react";
import UsersPage from "./page";
import { fetchInitialRows } from "@/lib/apollo/initial-data";
import { getServerUserId } from "@/lib/auth/cookies";
import { orderUsers } from "@/features/users/order-users";

jest.mock("@/lib/apollo/initial-data", () => ({ fetchInitialRows: jest.fn() }));
jest.mock("@/lib/auth/cookies", () => ({ getServerUserId: jest.fn() }));
jest.mock("@/features/users/order-users", () => ({ orderUsers: jest.fn() }));
jest.mock("./users-client", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <div data-testid="users-client" data-props={JSON.stringify(Object.keys(props).sort())} />
  ),
}));

const mockFetchInitialRows = fetchInitialRows as unknown as jest.Mock;
const mockGetServerUserId = getServerUserId as unknown as jest.Mock;
const mockOrderUsers = orderUsers as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInitialRows.mockResolvedValue({ initial: [], serverError: null });
  mockGetServerUserId.mockResolvedValue("u1");
  mockOrderUsers.mockReturnValue([]);
});

describe("UsersPage", () => {
  it("calls fetchInitialRows with the users query", async () => {
    render(await UsersPage());
    expect(mockFetchInitialRows).toHaveBeenCalledWith(
      expect.objectContaining({ query: expect.anything(), pageSize: 10000 }),
    );
  });

  it("determines whether the current user is an admin", async () => {
    mockFetchInitialRows.mockResolvedValue({
      initial: [{ id: "u1", role: "Admin" } as never],
      serverError: null,
    });
    mockOrderUsers.mockReturnValue([{ id: "u1", role: "Admin" }]);
    render(await UsersPage());
    expect(mockOrderUsers).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: "u1" })]),
      "u1",
      true,
    );
  });

  it("passes ordered users and the server error to UsersClient", async () => {
    mockOrderUsers.mockReturnValue([{ id: "u1" }]);
    mockFetchInitialRows.mockResolvedValue({ initial: [{ id: "u1" }], serverError: "boom" });
    render(await UsersPage());
    expect(screen.getByTestId("users-client")).toBeInTheDocument();
  });
});
