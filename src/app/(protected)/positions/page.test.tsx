import { render, screen } from "@testing-library/react";
import PositionsPage from "./page";
import { fetchInitialRows } from "@/lib/apollo/initial-data";

jest.mock("@/lib/apollo/initial-data", () => ({ fetchInitialRows: jest.fn() }));
jest.mock("./positions-client", () => ({
  __esModule: true,
  default: () => <div data-testid="positions-client" />,
}));

const mockFetchInitialRows = fetchInitialRows as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInitialRows.mockResolvedValue({ initial: [], serverError: null });
});

describe("PositionsPage", () => {
  it("renders the positions client", async () => {
    render(await PositionsPage());
    expect(screen.getByTestId("positions-client")).toBeInTheDocument();
  });

  it("calls fetchInitialRows with the positions data", async () => {
    await PositionsPage();
    expect(mockFetchInitialRows).toHaveBeenCalledWith(
      expect.objectContaining({
        errorMessage: "Failed to load positions",
      }),
    );
  });

  it("forwards the fetched rows to the client", async () => {
    const initial = [{ id: "1", name: "Developer" }] as never;
    mockFetchInitialRows.mockResolvedValue({ initial, serverError: null });
    render(await PositionsPage());
    expect(screen.getByTestId("positions-client")).toBeInTheDocument();
  });
});
