import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddProjectDialog } from "./add-project-dialog";
import { UpdateProjectDialog } from "./update-project-dialog";
import { RemoveProjectDialog } from "./remove-project-dialog";
import { makeCvProject } from "@/test-utils/cv-fixtures";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const mockToastError = jest.fn();
jest.mock("sonner", () => ({
  get toast() {
    return { error: mockToastError };
  },
}));

const allProjects = [
  {
    id: "prj1",
    name: "Alpha",
    internal_name: "alpha",
    domain: "Web",
    start_date: "2024-01-01",
    end_date: null,
    description: "First project",
    environment: ["React"],
  },
  {
    id: "prj2",
    name: "Beta",
    internal_name: "beta",
    domain: "Mobile",
    start_date: "2024-02-01",
    end_date: "2024-08-01",
    description: "Second project",
    environment: ["Swift"],
  },
];

const project = makeCvProject({
  id: "cp1",
  name: "Alpha",
  start_date: "2024-01-01",
  end_date: null,
  roles: ["Lead"],
  responsibilities: ["Ship it"],
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AddProjectDialog", () => {
  it("disables submit until a project is selected", async () => {
    const user = userEvent.setup();
    render(
      <AddProjectDialog
        open
        onOpenChange={jest.fn()}
        allProjects={allProjects}
        onConfirm={jest.fn()}
        loading={false}
      />,
    );
    expect(screen.getByRole("button", { name: "add" })).toBeDisabled();
    const item = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "Alpha");
    await user.click(item!);
    expect(screen.getByRole("button", { name: "add" })).toBeEnabled();
  });

  it("prefills the domain and dates when a project is selected", async () => {
    const user = userEvent.setup();
    render(
      <AddProjectDialog
        open
        onOpenChange={jest.fn()}
        allProjects={allProjects}
        onConfirm={jest.fn()}
        loading={false}
      />,
    );
    const item = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "Alpha");
    await user.click(item!);
    expect(screen.getAllByRole("textbox")[0]).toHaveValue("Web");
    expect(screen.getAllByText("01/01/2024").length).toBeGreaterThanOrEqual(1);
  });

  it("submits the selected project with parsed roles and responsibilities", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(
      <AddProjectDialog
        open
        onOpenChange={jest.fn()}
        allProjects={allProjects}
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    const item = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "Beta");
    await user.click(item!);
    await user.type(
      screen.getByPlaceholderText("rolesAndResponsibilities"),
      "Lead\nShip the product",
    );
    await user.click(screen.getByRole("button", { name: "add" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        projectId: "prj2",
        start_date: expect.any(String),
        end_date: expect.any(String),
        roles: ["Lead"],
        responsibilities: ["Ship the product"],
      }),
    );
  });

  it("shows an error toast when the confirm fails", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockRejectedValue(new Error("boom"));
    render(
      <AddProjectDialog
        open
        onOpenChange={jest.fn()}
        allProjects={allProjects}
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    const item = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "Alpha");
    await user.click(item!);
    await user.click(screen.getByRole("button", { name: "add" }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("addProjectFailed"));
  });
});

describe("UpdateProjectDialog", () => {
  it("prefills the editable fields with the project data", () => {
    render(
      <UpdateProjectDialog
        open
        onOpenChange={jest.fn()}
        project={project}
        onConfirm={jest.fn()}
        loading={false}
      />,
    );
    expect(
      (screen.getByPlaceholderText("rolesAndResponsibilities") as HTMLTextAreaElement).value,
    ).toBe("Lead\nShip it");
    expect(screen.getAllByText("01/01/2024").length).toBeGreaterThanOrEqual(1);
  });

  it("disables submit while nothing changed", () => {
    render(
      <UpdateProjectDialog
        open
        onOpenChange={jest.fn()}
        project={project}
        onConfirm={jest.fn()}
        loading={false}
      />,
    );
    expect(screen.getByRole("button", { name: "update" })).toBeDisabled();
  });

  it("enables submit once the roles input changes and submits the parsed values", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(
      <UpdateProjectDialog
        open
        onOpenChange={jest.fn()}
        project={project}
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    const roles = screen.getByPlaceholderText("rolesAndResponsibilities");
    await user.clear(roles);
    await user.type(roles, "Lead\nShip the product");
    expect(screen.getByRole("button", { name: "update" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        projectId: "prj1",
        start_date: expect.any(String),
        end_date: null,
        roles: ["Lead"],
        responsibilities: ["Ship the product"],
      }),
    );
  });

  it("shows an error toast when the update fails", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockRejectedValue(new Error("boom"));
    render(
      <UpdateProjectDialog
        open
        onOpenChange={jest.fn()}
        project={project}
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    const roles = screen.getByPlaceholderText("rolesAndResponsibilities");
    await user.clear(roles);
    await user.type(roles, "Tech Lead");
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("updateProjectFailed"));
  });
});

describe("RemoveProjectDialog", () => {
  it("sends the project id and notifies onClose", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    render(
      <RemoveProjectDialog
        target={project}
        onClose={onClose}
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("prj1"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows an error toast and keeps the dialog open when removal fails", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockRejectedValue(new Error("boom"));
    const onClose = jest.fn();
    render(
      <RemoveProjectDialog
        target={project}
        onClose={onClose}
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("removeProjectFailed"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
