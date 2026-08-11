import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddLanguageDialog } from "./add-language-dialog";
import { toast } from "sonner";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("sonner", () => ({ toast: { error: jest.fn() } }));
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const mockToastError = toast.error as unknown as jest.Mock;

const availableLanguages = [
  { id: "1", name: "English" },
  { id: "2", name: "German" },
];

const onConfirm = jest.fn().mockResolvedValue(undefined);
const onOpenChange = jest.fn();

function renderDialog(overrides: Partial<Parameters<typeof AddLanguageDialog>[0]> = {}) {
  return render(
    <AddLanguageDialog
      open={true}
      onOpenChange={onOpenChange}
      availableLanguages={availableLanguages}
      onConfirm={onConfirm}
      loading={false}
      {...overrides}
    />,
  );
}

describe("AddLanguageDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with available language options and proficiency options", () => {
    renderDialog();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("German")).toBeInTheDocument();
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("B2")).toBeInTheDocument();
  });

  it("disables the confirm button when no language is selected", () => {
    renderDialog();
    const confirm = screen.getByText("confirm");
    expect(confirm.closest("button")).toBeDisabled();
  });

  it("selects a language and proficiency, then confirms the action", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByText("English"));
    await user.click(screen.getByText("B2"));
    await user.click(screen.getByText("confirm"));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("English", "B2"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows an error toast when the confirm action fails", async () => {
    onConfirm.mockRejectedValue(new Error("fail"));
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByText("English"));
    await user.click(screen.getByText("confirm"));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("addLanguageFailed"));
  });

  it("renders without language options when none are available", () => {
    renderDialog({ availableLanguages: [] });
    expect(screen.queryByText("English")).not.toBeInTheDocument();
  });

  it("shows the loading state on the confirm button", () => {
    renderDialog({ loading: true });
    expect(screen.getByText("confirming")).toBeInTheDocument();
  });
});
