import { render, screen } from "@testing-library/react";
import ProjectsPage from "./page";
import { fetchInitialRows } from "@/lib/apollo/initial-data";

jest.mock("@/lib/apollo/initial-data", () => ({ fetchInitialRows: jest.fn() }));
jest.mock("./projects-client", () => ({
  __esModule: true,
  default: () => <div data-testid="projects-client" />,
}));

const mockFetchInitialRows = fetchInitialRows as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInitialRows.mockResolvedValue({ initial: [], serverError: null });
});

describe("ProjectsPage", () => {
  it("renders the projects client", async () => {
    render(await ProjectsPage());
    expect(screen.getByTestId("projects-client")).toBeInTheDocument();
  });

  it("calls fetchInitialRows with the projects data", async () => {
    await ProjectsPage();
    expect(mockFetchInitialRows).toHaveBeenCalledWith(
      expect.objectContaining({
        errorMessage: "Failed to load projects",
      }),
    );
  });

  it("forwards the fetched rows to the client", async () => {
    const initial = [{ id: "1", name: "Alpha" }] as never;
    mockFetchInitialRows.mockResolvedValue({ initial, serverError: null });
    render(await ProjectsPage());
    expect(screen.getByTestId("projects-client")).toBeInTheDocument();
  });
});
