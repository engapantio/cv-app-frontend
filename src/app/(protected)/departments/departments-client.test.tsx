import { render, screen } from "@testing-library/react";
import DepartmentsClient from "./departments-client";
import { useDepartmentsPage } from "@/features/departments/hooks/use-departments-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/features/departments/hooks/use-departments-page", () => ({
  useDepartmentsPage: jest.fn(),
}));
jest.mock("@/features/departments/components/departments-table", () => ({
  DepartmentsTable: () => <div data-testid="departments-table" />,
}));

const mockUseDepartmentsPage = useDepartmentsPage as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDepartmentsPage.mockReturnValue({});
});

describe("DepartmentsClient", () => {
  it("renders the page title and the departments table", () => {
    render(<DepartmentsClient initialDepartments={[]} serverError={null} />);
    expect(screen.getByText("departments")).toBeInTheDocument();
    expect(screen.getByTestId("departments-table")).toBeInTheDocument();
  });

  it("passes the initial rows to the hook", () => {
    const departments = [{ id: "1", name: "IT" }] as never;
    render(<DepartmentsClient initialDepartments={departments} serverError={null} />);
    expect(mockUseDepartmentsPage).toHaveBeenCalledWith(departments);
  });

  it("forwards the server error to the table", () => {
    render(<DepartmentsClient initialDepartments={[]} serverError="Failed to load" />);
    expect(screen.getByTestId("departments-table")).toBeInTheDocument();
  });
});
