import { render, screen } from "@testing-library/react";
import CvDetailsPage from "./page";
import { fetchInitialRecord } from "@/lib/apollo/initial-data";
import { makeCv } from "@/test-utils/cv-fixtures";

jest.mock("@/lib/apollo/initial-data", () => ({ fetchInitialRecord: jest.fn() }));
jest.mock("./details-client", () => ({
  __esModule: true,
  default: () => <div data-testid="details-client" />,
}));

const mockFetchInitialRecord = fetchInitialRecord as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInitialRecord.mockResolvedValue({ initial: makeCv(), serverError: null });
});

describe("CvDetailsPage", () => {
  it("renders the details client", async () => {
    render(await CvDetailsPage({ params: Promise.resolve({ cvId: "cv1" }) }));
    expect(screen.getByTestId("details-client")).toBeInTheDocument();
  });

  it("calls fetchInitialRecord with the cv data", async () => {
    await CvDetailsPage({ params: Promise.resolve({ cvId: "cv1" }) });
    expect(mockFetchInitialRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { cvId: "cv1" },
        errorMessage: "Failed to load CV",
        notFoundMessage: "CV not found",
      }),
    );
  });
});
