import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddSkillDialog } from "./add-skill-dialog";
import { UpdateSkillDialog } from "./update-skill-dialog";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const mockToastError = jest.fn();
jest.mock("sonner", () => ({
  get toast() {
    return { error: mockToastError };
  },
}));

const availableSkills = [
  { name: "TypeScript", category_name: "Development", category_parent_name: null },
  { name: "Figma", category_name: "Design", category_parent_name: null },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AddSkillDialog", () => {
  it("disables submit until a skill is selected", async () => {
    const user = userEvent.setup();
    render(
      <AddSkillDialog
        open
        onOpenChange={jest.fn()}
        availableSkills={availableSkills}
        onConfirm={jest.fn()}
        loading={false}
      />,
    );
    expect(screen.getByRole("button", { name: "confirm" })).toBeDisabled();
    const item = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "TypeScript");
    await user.click(item!);
    expect(screen.getByRole("button", { name: "confirm" })).toBeEnabled();
  });

  it("submits the selected skill with the default mastery and closes", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const onOpenChange = jest.fn();
    render(
      <AddSkillDialog
        open
        onOpenChange={onOpenChange}
        availableSkills={availableSkills}
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    const item = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "Figma");
    await user.click(item!);
    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("Figma", "Novice"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("passes the selected mastery through", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(
      <AddSkillDialog
        open
        onOpenChange={jest.fn()}
        availableSkills={availableSkills}
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    const skillItem = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "TypeScript");
    await user.click(skillItem!);
    const masteryItem = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "Expert");
    await user.click(masteryItem!);
    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("TypeScript", "Expert"));
  });

  it("shows an error toast and stays open when the confirm fails", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockRejectedValue(new Error("boom"));
    const onOpenChange = jest.fn();
    render(
      <AddSkillDialog
        open
        onOpenChange={onOpenChange}
        availableSkills={availableSkills}
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    const item = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "TypeScript");
    await user.click(item!);
    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("addSkillFailed"));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("UpdateSkillDialog", () => {
  it("prefills the read-only skill name", () => {
    render(
      <UpdateSkillDialog
        open
        onOpenChange={jest.fn()}
        skillName="TypeScript"
        currentMastery="Proficient"
        onConfirm={jest.fn()}
        loading={false}
      />,
    );
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("TypeScript");
  });

  it("disables submit when the mastery is unchanged", () => {
    render(
      <UpdateSkillDialog
        open
        onOpenChange={jest.fn()}
        skillName="TypeScript"
        currentMastery="Proficient"
        onConfirm={jest.fn()}
        loading={false}
      />,
    );
    expect(screen.getByRole("button", { name: "confirm" })).toBeDisabled();
  });

  it("submits the skill name and new mastery and closes", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const onOpenChange = jest.fn();
    render(
      <UpdateSkillDialog
        open
        onOpenChange={onOpenChange}
        skillName="TypeScript"
        currentMastery="Proficient"
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    const masteryItem = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "Expert");
    await user.click(masteryItem!);
    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("TypeScript", "Expert"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows an error toast and stays open when the confirm fails", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockRejectedValue(new Error("boom"));
    const onOpenChange = jest.fn();
    render(
      <UpdateSkillDialog
        open
        onOpenChange={onOpenChange}
        skillName="TypeScript"
        currentMastery="Proficient"
        onConfirm={onConfirm}
        loading={false}
      />,
    );

    const masteryItem = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "Expert");
    await user.click(masteryItem!);
    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("updateAssignedSkillFailed"));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
