import { render, screen } from "@testing-library/react";
import SkillsClient from "./skills-client";
import { useSkillsPage } from "@/features/skills/hooks/use-skills-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/features/skills/hooks/use-skills-page", () => ({ useSkillsPage: jest.fn() }));
jest.mock("@/features/skills/components/skills-table", () => ({
  SkillsTable: () => <div data-testid="skills-table" />,
}));

const mockUseSkillsPage = useSkillsPage as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSkillsPage.mockReturnValue({});
});

describe("SkillsClient", () => {
  it("renders the page title and the skills table", () => {
    render(<SkillsClient initialSkills={[]} initialCategories={[]} serverError={null} />);
    expect(screen.getByText("skills")).toBeInTheDocument();
    expect(screen.getByTestId("skills-table")).toBeInTheDocument();
  });

  it("passes the initial rows and categories to the hook", () => {
    const skills = [{ id: "1", name: "React" }] as never;
    const categories = [{ id: "c1", name: "Frontend" }] as never;
    render(
      <SkillsClient initialSkills={skills} initialCategories={categories} serverError={null} />,
    );
    expect(mockUseSkillsPage).toHaveBeenCalledWith(skills, null, categories);
  });

  it("forwards the server error to the hook and table", () => {
    render(<SkillsClient initialSkills={[]} initialCategories={[]} serverError="Failed to load" />);
    expect(screen.getByTestId("skills-table")).toBeInTheDocument();
  });
});
