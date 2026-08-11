import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpdateLanguageDialog } from "./update-language-dialog";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const currentLanguage = { name: "English", proficiency: "B1" as const };
const onConfirm = jest.fn().mockResolvedValue(undefined);
const onOpenChange = jest.fn();

function renderDialog(overrides: Partial<Parameters<typeof UpdateLanguageDialog>[0]> = {}) {
  return render(
    <UpdateLanguageDialog
      open={true}
      onOpenChange={onOpenChange}
      currentLanguage={currentLanguage}
      onConfirm={onConfirm}
      loading={false}
      {...overrides}
    />,
  );
}

describe("UpdateLanguageDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays the current language name", () => {
    renderDialog();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("disables the confirm button when the proficiency is unchanged", () => {
    renderDialog();
    const confirm = screen.getByText("confirm");
    expect(confirm.closest("button")).toBeDisabled();
  });

  it("enables the confirm button after changing the proficiency", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByText("B1"));
    await user.click(screen.getByText("C1"));
    const confirm = screen.getByText("confirm");
    expect(confirm.closest("button")).toBeEnabled();
    await user.click(confirm);
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("English", "C1"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows the loading state on the confirm button", () => {
    renderDialog({ loading: true });
    expect(screen.getByText("updating")).toBeInTheDocument();
  });

  it("resets proficiency when re-opened with a different current language", async () => {
    const { rerender } = render(
      <UpdateLanguageDialog
        open={false}
        onOpenChange={onOpenChange}
        currentLanguage={currentLanguage}
        onConfirm={onConfirm}
        loading={false}
      />,
    );
    rerender(
      <UpdateLanguageDialog
        open={true}
        onOpenChange={onOpenChange}
        currentLanguage={{ name: "German", proficiency: "A2" }}
        onConfirm={onConfirm}
        loading={false}
      />,
    );
    expect(screen.getByText("A2")).toBeInTheDocument();
  });
});
