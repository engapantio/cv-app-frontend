import { render, screen } from "@testing-library/react";
import CvSkillsPage from "./page";
import { fetchInitialRecord, fetchSkillsCatalog } from "@/lib/apollo/initial-data";

jest.mock("@/lib/apollo/initial-data", () => ({
  fetchInitialRecord: jest.fn(),
  fetchSkillsCatalog: jest.fn(),
}));
jest.mock("./cv-skills-client", () => ({
  CvSkillsClient: () => <div data-testid="cv-skills-client" />,
}));

const mockFetchInitialRecord = fetchInitialRecord as unknown as jest.Mock;
const mockFetchSkillsCatalog = fetchSkillsCatalog as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInitialRecord.mockResolvedValue({ initial: null, serverError: null });
  mockFetchSkillsCatalog.mockResolvedValue({ skills: [], categories: [] });
});

describe("CvSkillsPage", () => {
  it("renders the cv skills client", async () => {
    render(await CvSkillsPage({ params: Promise.resolve({ cvId: "cv1" }) }));
    expect(screen.getByTestId("cv-skills-client")).toBeInTheDocument();
  });

  it("calls fetchInitialRecord with the cv data and fetches the catalog", async () => {
    await CvSkillsPage({ params: Promise.resolve({ cvId: "cv1" }) });
    expect(mockFetchInitialRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { cvId: "cv1" },
        errorMessage: "Failed to load CV",
      }),
    );
    expect(mockFetchSkillsCatalog).toHaveBeenCalled();
  });
});
