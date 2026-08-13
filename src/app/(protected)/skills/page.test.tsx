import { render, screen } from "@testing-library/react";
import SkillsPage from "./page";
import { fetchInitialRows } from "@/lib/apollo/initial-data";

jest.mock("@/lib/apollo/initial-data", () => ({ fetchInitialRows: jest.fn() }));
jest.mock("./skills-client", () => ({
  __esModule: true,
  default: () => <div data-testid="skills-client" />,
}));

const mockFetchInitialRows = fetchInitialRows as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInitialRows.mockResolvedValue({ initial: [], serverError: null });
});

describe("SkillsPage", () => {
  it("renders the skills client", async () => {
    render(await SkillsPage());
    expect(screen.getByTestId("skills-client")).toBeInTheDocument();
  });

  it("fetches skills and skill categories", async () => {
    await SkillsPage();
    expect(mockFetchInitialRows).toHaveBeenCalledTimes(2);
    expect(mockFetchInitialRows).toHaveBeenCalledWith(
      expect.objectContaining({ errorMessage: "Failed to load skills" }),
    );
  });

  it("forwards the fetched rows and categories to the client", async () => {
    render(await SkillsPage());
    expect(screen.getByTestId("skills-client")).toBeInTheDocument();
  });
});
