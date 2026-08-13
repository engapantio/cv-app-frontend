import { render, screen } from "@testing-library/react";
import CvsPage from "./page";
import { fetchInitialRows } from "@/lib/apollo/initial-data";

jest.mock("@/lib/apollo/initial-data", () => ({ fetchInitialRows: jest.fn() }));
jest.mock("./cvs-list-client", () => ({
  __esModule: true,
  default: () => <div data-testid="cvs-list-client" />,
}));

const mockFetchInitialRows = fetchInitialRows as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInitialRows.mockResolvedValue({ initial: [], serverError: null });
});

describe("CvsPage", () => {
  it("renders the cvs list client", async () => {
    render(await CvsPage());
    expect(screen.getByTestId("cvs-list-client")).toBeInTheDocument();
  });

  it("calls fetchInitialRows with the global CV data", async () => {
    await CvsPage();
    expect(mockFetchInitialRows).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.anything(),
        errorMessage: "Failed to load CVs",
      }),
    );
  });
});
