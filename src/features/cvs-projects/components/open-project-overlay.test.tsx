import { render, screen } from "@testing-library/react";
import { OpenProjectOverlay } from "./open-project-overlay";
import type { CvProjectItem } from "../types";
import { makeCvProject } from "@/test-utils/cv-fixtures";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared", () => ({
  EnvPill: ({ env }: { env: string }) => <span>{env}</span>,
}));

const project: CvProjectItem = makeCvProject();

describe("OpenProjectOverlay (cv projects)", () => {
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
    expect(screen.getByText((_, el) => el?.textContent === "Lead\nShip it")).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.textContent === "First project")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Alpha")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Web")).toBeInTheDocument();
    expect(screen.getByDisplayValue("01/01/2024")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("uses the project display name when the relation is missing", () => {
    render(
      <OpenProjectOverlay
        open
        onOpenChange={jest.fn()}
        project={{ ...project, project: null as unknown as CvProjectItem["project"] }}
      />,
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("shows an em dash when the end date is missing", () => {
    render(
      <OpenProjectOverlay open onOpenChange={jest.fn()} project={{ ...project, end_date: null }} />,
    );
    expect(screen.getByDisplayValue("—")).toBeInTheDocument();
  });
});
