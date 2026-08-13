import { render, screen } from "@testing-library/react";
import CvProjectsPage from "./page";
import { fetchInitialRecord } from "@/lib/apollo/initial-data";
import { makeCv } from "@/test-utils/cv-fixtures";

jest.mock("@/lib/apollo/initial-data", () => ({ fetchInitialRecord: jest.fn() }));
jest.mock("./projects-client", () => ({
  __esModule: true,
  default: () => <div data-testid="projects-client" />,
}));

const mockFetchInitialRecord = fetchInitialRecord as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInitialRecord.mockResolvedValue({ initial: makeCv(), serverError: null });
});

describe("CvProjectsPage", () => {
  it("renders the projects client", async () => {
    render(await CvProjectsPage({ params: Promise.resolve({ cvId: "cv1" }) }));
    expect(screen.getByTestId("projects-client")).toBeInTheDocument();
  });

  it("calls fetchInitialRecord with the cv data", async () => {
    await CvProjectsPage({ params: Promise.resolve({ cvId: "cv1" }) });
    expect(mockFetchInitialRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { cvId: "cv1" },
        errorMessage: "Failed to load CV",
        notFoundMessage: "CV not found",
        requireAuth: true,
      }),
    );
  });
});
