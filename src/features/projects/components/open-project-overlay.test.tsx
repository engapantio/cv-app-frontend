import { render, screen } from "@testing-library/react";
import { OpenProjectOverlay } from "./open-project-overlay";
import type { ProjectItem } from "../hooks/use-projects-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared", () => ({
  EnvPill: ({ env }: { env: string }) => <span>{env}</span>,
}));

const project: ProjectItem = {
  id: "p1",
  created_at: "2024-01-01T00:00:00Z",
  name: "Beta",
  internal_name: "beta",
  domain: "Mobile",
  start_date: "2023-05-01",
  end_date: "2023-12-01",
  description: "A mobile project",
  environment: ["Kotlin", "Swift"],
} as ProjectItem;

describe("OpenProjectOverlay (projects)", () => {
  it("renders nothing when no project is set", () => {
    render(<OpenProjectOverlay open onOpenChange={jest.fn()} project={null} />);
    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<OpenProjectOverlay open={false} onOpenChange={jest.fn()} project={project} />);
    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
  });

  it("shows the project fields and environment pills", () => {
    render(<OpenProjectOverlay open onOpenChange={jest.fn()} project={project} />);
    expect(screen.getByDisplayValue("Beta")).toBeInTheDocument();
    expect(screen.getByDisplayValue("beta")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mobile")).toBeInTheDocument();
    expect(screen.getByDisplayValue("01/05/2023")).toBeInTheDocument();
    expect(screen.getByDisplayValue("01/12/2023")).toBeInTheDocument();
    expect(screen.getByText("A mobile project")).toBeInTheDocument();
    expect(screen.getByText("Kotlin")).toBeInTheDocument();
    expect(screen.getByText("Swift")).toBeInTheDocument();
  });

  it("shows the till now label when the end date is missing", () => {
    render(
      <OpenProjectOverlay open onOpenChange={jest.fn()} project={{ ...project, end_date: null }} />,
    );
    expect(screen.getByDisplayValue("tillNow")).toBeInTheDocument();
  });
});
