import { render, screen } from "@testing-library/react";
import DepartmentsPage from "./page";
import { fetchInitialRows } from "@/lib/apollo/initial-data";

jest.mock("@/lib/apollo/initial-data", () => ({ fetchInitialRows: jest.fn() }));
jest.mock("./departments-client", () => ({
  __esModule: true,
  default: () => <div data-testid="departments-client" />,
}));

const mockFetchInitialRows = fetchInitialRows as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInitialRows.mockResolvedValue({ initial: [], serverError: null });
});

describe("DepartmentsPage", () => {
  it("renders the departments client", async () => {
    render(await DepartmentsPage());
    expect(screen.getByTestId("departments-client")).toBeInTheDocument();
  });

  it("calls fetchInitialRows with the departments data", async () => {
    await DepartmentsPage();
    expect(mockFetchInitialRows).toHaveBeenCalledWith(
      expect.objectContaining({
        errorMessage: "Failed to load departments",
      }),
    );
  });

  it("forwards the fetched rows to the client", async () => {
    const initial = [{ id: "1", name: "IT" }] as never;
    mockFetchInitialRows.mockResolvedValue({ initial, serverError: null });
    render(await DepartmentsPage());
    expect(screen.getByTestId("departments-client")).toBeInTheDocument();
  });
});
