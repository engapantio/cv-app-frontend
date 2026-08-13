import { render, screen } from "@testing-library/react";
import LanguagesClient from "./languages-client";
import { useLanguagesPage } from "@/features/languages/hooks/use-languages-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/features/languages/hooks/use-languages-page", () => ({
  useLanguagesPage: jest.fn(),
}));
jest.mock("@/features/languages/components/languages-table", () => ({
  LanguagesTable: () => <div data-testid="languages-table" />,
}));

const mockUseLanguagesPage = useLanguagesPage as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLanguagesPage.mockReturnValue({});
});

describe("LanguagesClient", () => {
  it("renders the page title and the languages table", () => {
    render(<LanguagesClient initialLanguages={[]} serverError={null} />);
    expect(screen.getByText("languages")).toBeInTheDocument();
    expect(screen.getByTestId("languages-table")).toBeInTheDocument();
  });

  it("passes the initial rows to the hook", () => {
    const languages = [{ id: "1", name: "English" }] as never;
    render(<LanguagesClient initialLanguages={languages} serverError={null} />);
    expect(mockUseLanguagesPage).toHaveBeenCalledWith(languages);
  });

  it("forwards the server error to the table", () => {
    render(<LanguagesClient initialLanguages={[]} serverError="Failed to load" />);
    expect(screen.getByTestId("languages-table")).toBeInTheDocument();
  });
});
