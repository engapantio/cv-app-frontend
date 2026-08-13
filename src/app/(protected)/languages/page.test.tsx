import { render, screen } from "@testing-library/react";
import LanguagesPage from "./page";
import { fetchInitialRows } from "@/lib/apollo/initial-data";

jest.mock("@/lib/apollo/initial-data", () => ({ fetchInitialRows: jest.fn() }));
jest.mock("./languages-client", () => ({
  __esModule: true,
  default: () => <div data-testid="languages-client" />,
}));

const mockFetchInitialRows = fetchInitialRows as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInitialRows.mockResolvedValue({ initial: [], serverError: null });
});

describe("LanguagesPage", () => {
  it("renders the languages client", async () => {
    render(await LanguagesPage());
    expect(screen.getByTestId("languages-client")).toBeInTheDocument();
  });

  it("calls fetchInitialRows with the languages data", async () => {
    await LanguagesPage();
    expect(mockFetchInitialRows).toHaveBeenCalledWith(
      expect.objectContaining({
        errorMessage: "Failed to load languages",
      }),
    );
  });

  it("forwards the fetched rows to the client", async () => {
    const initial = [{ id: "1", name: "English" }] as never;
    mockFetchInitialRows.mockResolvedValue({ initial, serverError: null });
    render(await LanguagesPage());
    expect(screen.getByTestId("languages-client")).toBeInTheDocument();
  });
});
