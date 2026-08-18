import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation } from "@apollo/client/react";
import { CreateLanguageDialog } from "./create-language-dialog";
import { UpdateLanguageDialog } from "./update-language-dialog";
import { DeleteLanguageDialog } from "./delete-language-dialog";
import type { LanguageItem } from "../types";

jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const mockToastError = jest.fn();

jest.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

const mockUseMutation = useMutation as unknown as jest.Mock;

const target: LanguageItem = {
  id: "7",
  created_at: "2024-01-01T00:00:00Z",
  iso2: "en",
  name: "English",
  native_name: "English",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
});

describe("CreateLanguageDialog", () => {
  it("disables submit until the form is dirty", async () => {
    const user = userEvent.setup();
    render(<CreateLanguageDialog open onOpenChange={jest.fn()} onCreated={jest.fn()} />);
    expect(screen.getByRole("button", { name: "create" })).toBeDisabled();
    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "English");
    expect(screen.getByRole("button", { name: "create" })).toBeEnabled();
  });

  it("sends the correct variables and notifies onCreated", async () => {
    const user = userEvent.setup();
    const createLanguage = jest.fn().mockResolvedValue({
      data: {
        createLanguage: {
          id: "1",
          created_at: "",
          iso2: "en",
          name: "English",
          native_name: "English",
        },
      },
    });
    mockUseMutation.mockReturnValue([createLanguage, { loading: false }]);

    const onCreated = jest.fn();
    const onOpenChange = jest.fn();
    render(<CreateLanguageDialog open onOpenChange={onOpenChange} onCreated={onCreated} />);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "English");
    await user.type(inputs[1], "English");
    await user.type(inputs[2], "en");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() =>
      expect(createLanguage).toHaveBeenCalledWith({
        variables: { language: { name: "English", iso2: "en", native_name: "English" } },
      }),
    );
    expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("sends null native_name when left empty", async () => {
    const user = userEvent.setup();
    const createLanguage = jest.fn().mockResolvedValue({
      data: {
        createLanguage: { id: "2", created_at: "", iso2: "de", name: "German", native_name: null },
      },
    });
    mockUseMutation.mockReturnValue([createLanguage, { loading: false }]);
    render(<CreateLanguageDialog open onOpenChange={jest.fn()} onCreated={jest.fn()} />);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "German");
    await user.type(inputs[2], "de");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() =>
      expect(createLanguage).toHaveBeenCalledWith({
        variables: { language: { name: "German", iso2: "de", native_name: null } },
      }),
    );
  });

  it("does not submit when iso2 is invalid (length 1)", async () => {
    const user = userEvent.setup();
    const createLanguage = jest.fn();
    mockUseMutation.mockReturnValue([createLanguage, { loading: false }]);
    render(<CreateLanguageDialog open onOpenChange={jest.fn()} onCreated={jest.fn()} />);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "German");
    await user.type(inputs[2], "e");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => expect(createLanguage).not.toHaveBeenCalled());
  });

  it("shows a friendly toast when the language already exists", async () => {
    const user = userEvent.setup();
    const createLanguage = jest.fn().mockRejectedValue({
      graphQLErrors: [
        {
          message:
            'duplicate key value violates unique constraint "UQ_7df7d1e250ea2a416f078a631fb"',
        },
      ],
    });
    mockUseMutation.mockReturnValue([createLanguage, { loading: false }]);

    const onCreated = jest.fn();
    const onOpenChange = jest.fn();
    render(<CreateLanguageDialog open onOpenChange={onOpenChange} onCreated={onCreated} />);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "English");
    await user.type(inputs[2], "en");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("languageAlreadyExists"));
    expect(onCreated).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("shows a generic toast when creation fails for another reason", async () => {
    const user = userEvent.setup();
    const createLanguage = jest.fn().mockRejectedValue(new Error("network error"));
    mockUseMutation.mockReturnValue([createLanguage, { loading: false }]);
    render(<CreateLanguageDialog open onOpenChange={jest.fn()} onCreated={jest.fn()} />);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "English");
    await user.type(inputs[2], "en");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("createLanguageFailed"));
  });
});

describe("UpdateLanguageDialog", () => {
  it("disables submit when nothing changed", () => {
    render(<UpdateLanguageDialog target={target} onClose={jest.fn()} onUpdated={jest.fn()} />);
    expect(screen.getByRole("button", { name: "update" })).toBeDisabled();
  });

  it("sends languageId and updated values", async () => {
    const user = userEvent.setup();
    const updateLanguage = jest.fn().mockResolvedValue({
      data: {
        updateLanguage: {
          id: "7",
          created_at: "",
          iso2: "en",
          name: "British English",
          native_name: "English",
        },
      },
    });
    mockUseMutation.mockReturnValue([updateLanguage, { loading: false }]);

    const onUpdated = jest.fn();
    const onClose = jest.fn();
    render(<UpdateLanguageDialog target={target} onClose={onClose} onUpdated={onUpdated} />);

    const nameInput = screen.getAllByRole("textbox")[0];
    await user.clear(nameInput);
    await user.type(nameInput, "British English");
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() =>
      expect(updateLanguage).toHaveBeenCalledWith({
        variables: {
          language: {
            languageId: "7",
            name: "British English",
            iso2: "en",
            native_name: "English",
          },
        },
      }),
    );
    expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ id: "7" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows the target name prefilled", () => {
    render(<UpdateLanguageDialog target={target} onClose={jest.fn()} onUpdated={jest.fn()} />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    expect(inputs[0].value).toBe("English");
    expect(inputs[2].value).toBe("en");
  });
});

describe("DeleteLanguageDialog", () => {
  it("sends the languageId and notifies onDeleted", async () => {
    const user = userEvent.setup();
    const deleteLanguage = jest
      .fn()
      .mockResolvedValue({ data: { deleteLanguage: { affected: 1 } } });
    mockUseMutation.mockReturnValue([deleteLanguage, { loading: false }]);

    const onDeleted = jest.fn();
    const onClose = jest.fn();
    render(<DeleteLanguageDialog target={target} onClose={onClose} onDeleted={onDeleted} />);

    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() =>
      expect(deleteLanguage).toHaveBeenCalledWith({
        variables: { language: { languageId: "7" } },
      }),
    );
    expect(onDeleted).toHaveBeenCalledWith("7");
    expect(onClose).toHaveBeenCalled();
  });
});
