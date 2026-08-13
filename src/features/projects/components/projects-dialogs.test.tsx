import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateProjectDialog } from "./create-project-dialog";
import { UpdateProjectDialog } from "./update-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import type { ProjectItem } from "../hooks/use-projects-page";
import { useSkillsList } from "@/lib/apollo/use-skills-list";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));
jest.mock("@/lib/apollo/use-skills-list", () => ({ useSkillsList: jest.fn() }));

const mockUseSkillsList = useSkillsList as unknown as jest.Mock;

const mockToastError = jest.fn();
jest.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSkillsList.mockReturnValue({
    data: { skills: [{ name: "React" }, { name: "Node" }] },
    loading: false,
  });
});

const project: ProjectItem = {
  id: "7",
  created_at: "2024-01-01T00:00:00Z",
  name: "Alpha",
  internal_name: "alpha",
  domain: "Web",
  start_date: "2024-01-01",
  end_date: null,
  description: "First project",
  environment: ["React"],
};

async function fillCreateFields(user: ReturnType<typeof userEvent.setup>) {
  const textboxes = screen.getAllByRole("textbox");
  await user.type(textboxes[0], "Beta");
  await user.type(textboxes[1], "Mobile");
  await user.type(textboxes[2], "Second project");
  await user.click(screen.getAllByTestId("select-date")[0]);
}

describe("CreateProjectDialog", () => {
  it("keeps submit disabled until required fields are provided", () => {
    render(
      <CreateProjectDialog open onOpenChange={jest.fn()} onConfirm={jest.fn()} loading={false} />,
    );
    expect(screen.getByRole("button", { name: "create" })).toBeDisabled();
  });

  it("submits the collected form data once required fields are present", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const onOpenChange = jest.fn();
    render(
      <CreateProjectDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    await fillCreateFields(user);
    expect(screen.getByRole("button", { name: "create" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Beta",
          domain: "Mobile",
          description: "Second project",
          start_date: new Date("2024-01-15T00:00:00.000Z").toISOString(),
          end_date: null,
          environment: [],
        }),
      ),
    );
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("resets the form after a successful confirm", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <CreateProjectDialog open onOpenChange={jest.fn()} onConfirm={onConfirm} loading={false} />,
    );
    await fillCreateFields(user);
    await user.click(screen.getByRole("button", { name: "create" }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    rerender(
      <CreateProjectDialog open onOpenChange={jest.fn()} onConfirm={onConfirm} loading={false} />,
    );
  });

  it("toggles environment skills via the checkbox list", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(
      <CreateProjectDialog open onOpenChange={jest.fn()} onConfirm={onConfirm} loading={false} />,
    );
    await fillCreateFields(user);
    await user.click(screen.getByLabelText("React"));
    await user.click(screen.getByRole("button", { name: "create" }));
    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ environment: ["React"] })),
    );
  });
});

describe("UpdateProjectDialog", () => {
  it("prefills the form with existing values", () => {
    render(
      <UpdateProjectDialog
        open
        onOpenChange={jest.fn()}
        project={project}
        onConfirm={jest.fn()}
        loading={false}
      />,
    );
    const textboxes = screen.getAllByRole("textbox") as HTMLTextAreaElement[];
    expect(textboxes[0].value).toBe("Alpha");
    expect(textboxes[1].value).toBe("Web");
    expect(textboxes[2].value).toBe("First project");
  });

  it("disables submit when nothing changed", () => {
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

  it("submits the projectId and updated values", async () => {
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

    const nameInput = screen.getAllByRole("textbox")[0];
    await user.clear(nameInput);
    await user.type(nameInput, "Alpha2");
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: "7", name: "Alpha2", domain: "Web" }),
      ),
    );
  });
});

describe("DeleteProjectDialog", () => {
  it("confirms the deletion with the project id", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    render(
      <DeleteProjectDialog
        target={project}
        onClose={onClose}
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("7"));
    expect(onClose).toHaveBeenCalled();
  });
});
