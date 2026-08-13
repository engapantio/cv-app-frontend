import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation, useQuery } from "@apollo/client/react";
import { CreateSkillDialog } from "./create-skill-dialog";
import { UpdateSkillDialog } from "./update-skill-dialog";
import { DeleteSkillDialog } from "./delete-skill-dialog";
import type { SkillItem } from "../types";
import type { SkillCategoriesQuery } from "@/gql/generated/graphql";

jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn(), useQuery: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const mockUseMutation = useMutation as unknown as jest.Mock;
const mockUseQuery = useQuery as unknown as jest.Mock;

const categories: SkillCategoriesQuery["skillCategories"] = [
  { id: "c1", name: "Programming Language", order: 1, parent: null, children: [] },
  { id: "c2", name: "Design", order: 2, parent: null, children: [] },
];

const target: SkillItem = {
  id: "7",
  created_at: "2024-01-01T00:00:00Z",
  name: "TypeScript",
  category_name: "Programming Language",
  category_parent_name: "Development",
  category: { id: "c1", name: "Programming Language", order: 1, parent: null },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
  mockUseQuery.mockReturnValue({ data: { skillCategories: categories }, loading: false });
});

describe("CreateSkillDialog", () => {
  it("disables submit until a name is provided", async () => {
    const user = userEvent.setup();
    render(<CreateSkillDialog open onOpenChange={jest.fn()} onCreated={jest.fn()} />);
    expect(screen.getByRole("button", { name: "create" })).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "Go");
    expect(screen.getByRole("button", { name: "create" })).toBeEnabled();
  });

  it("submits the name and selected category and notifies onCreated", async () => {
    const user = userEvent.setup();
    const createSkill = jest.fn().mockResolvedValue({
      data: {
        createSkill: {
          id: "3",
          created_at: "",
          name: "Go",
          category_name: "Programming Language",
          category_parent_name: null,
        },
      },
    });
    mockUseMutation.mockReturnValue([createSkill, { loading: false }]);

    const onCreated = jest.fn();
    const onOpenChange = jest.fn();
    render(<CreateSkillDialog open onOpenChange={onOpenChange} onCreated={onCreated} />);

    await user.type(screen.getByRole("textbox"), "Go");
    const categoryItem = screen
      .getAllByTestId("select-item")
      .find((el) => el.getAttribute("data-value") === "Programming Language");
    await user.click(categoryItem!);
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() =>
      expect(createSkill).toHaveBeenCalledWith({
        variables: { skill: { name: "Go", categoryId: "c1" } },
      }),
    );
    expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: "3" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("UpdateSkillDialog", () => {
  it("prefills the form with existing values", () => {
    render(<UpdateSkillDialog target={target} onClose={jest.fn()} onUpdated={jest.fn()} />);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("TypeScript");
  });

  it("disables submit when nothing changed", () => {
    render(<UpdateSkillDialog target={target} onClose={jest.fn()} onUpdated={jest.fn()} />);
    expect(screen.getByRole("button", { name: "update" })).toBeDisabled();
  });

  it("submits the skillId and updated values", async () => {
    const user = userEvent.setup();
    const updateSkill = jest.fn().mockResolvedValue({
      data: {
        updateSkill: {
          id: "7",
          created_at: "",
          name: "Typescript",
          category_name: "Programming Language",
          category_parent_name: null,
        },
      },
    });
    mockUseMutation.mockReturnValue([updateSkill, { loading: false }]);

    const onUpdated = jest.fn();
    const onClose = jest.fn();
    render(<UpdateSkillDialog target={target} onClose={onClose} onUpdated={onUpdated} />);

    const nameInput = screen.getByRole("textbox");
    await user.clear(nameInput);
    await user.type(nameInput, "Typescript");
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() =>
      expect(updateSkill).toHaveBeenCalledWith({
        variables: { skill: { skillId: "7", name: "Typescript", categoryId: "c1" } },
      }),
    );
    expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ id: "7" }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("DeleteSkillDialog", () => {
  it("sends the skillId and notifies onDeleted", async () => {
    const user = userEvent.setup();
    const deleteSkill = jest.fn().mockResolvedValue({ data: { deleteSkill: { affected: 1 } } });
    mockUseMutation.mockReturnValue([deleteSkill, { loading: false }]);

    const onDeleted = jest.fn();
    const onClose = jest.fn();
    render(<DeleteSkillDialog target={target} onClose={onClose} onDeleted={onDeleted} />);

    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() =>
      expect(deleteSkill).toHaveBeenCalledWith({
        variables: { skill: { skillId: "7" } },
      }),
    );
    expect(onDeleted).toHaveBeenCalledWith("7");
    expect(onClose).toHaveBeenCalled();
  });
});
