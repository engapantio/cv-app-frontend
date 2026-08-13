import { render, screen } from "@testing-library/react";
import PositionsClient from "./positions-client";
import { usePositionsPage } from "@/features/positions/hooks/use-positions-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/features/positions/hooks/use-positions-page", () => ({
  usePositionsPage: jest.fn(),
}));
jest.mock("@/features/positions/components/positions-table", () => ({
  PositionsTable: () => <div data-testid="positions-table" />,
}));

const mockUsePositionsPage = usePositionsPage as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUsePositionsPage.mockReturnValue({});
});

describe("PositionsClient", () => {
  it("renders the page title and the positions table", () => {
    render(<PositionsClient initialPositions={[]} serverError={null} />);
    expect(screen.getByText("positions")).toBeInTheDocument();
    expect(screen.getByTestId("positions-table")).toBeInTheDocument();
  });

  it("passes the initial rows to the hook", () => {
    const positions = [{ id: "1", name: "Developer" }] as never;
    render(<PositionsClient initialPositions={positions} serverError={null} />);
    expect(mockUsePositionsPage).toHaveBeenCalledWith(positions);
  });

  it("forwards the server error to the table", () => {
    render(<PositionsClient initialPositions={[]} serverError="Failed to load" />);
    expect(screen.getByTestId("positions-table")).toBeInTheDocument();
  });
});
