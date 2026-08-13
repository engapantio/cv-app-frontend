import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation } from "@apollo/client/react";
import { CreateCvDialog } from "./create-cv-dialog";
import { DeleteCvDialog } from "./delete-cv-dialog";

jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const mockUseMutation = useMutation as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
});

describe("CreateCvDialog", () => {
  function renderDialog() {
    const onCreated = jest.fn();
    const onOpenChange = jest.fn();
    render(<CreateCvDialog open onOpenChange={onOpenChange} userId="u1" onCreated={onCreated} />);
    return { onCreated, onOpenChange };
  }

  it("disables submit until a field is dirty", async () => {
    const user = userEvent.setup();
    renderDialog();
    expect(screen.getByRole("button", { name: "create" })).toBeDisabled();
    await user.type(screen.getAllByRole("textbox")[0], "Senior CV");
    expect(screen.getByRole("button", { name: "create" })).toBeEnabled();
  });

  it("shows a validation error when description is missing", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(screen.getAllByRole("textbox")[0], "Senior CV");
    await user.click(screen.getByRole("button", { name: "create" }));
    expect(await screen.findByText("descriptionRequired")).toBeInTheDocument();
  });

  it("submits the cv with the user id and notifies onCreated", async () => {
    const user = userEvent.setup();
    const createCv = jest.fn().mockResolvedValue({
      data: {
        createCv: {
          id: "c3",
          created_at: "",
          name: "Senior CV",
          education: null,
          description: "Backend",
        },
      },
    });
    mockUseMutation.mockReturnValue([createCv, { loading: false }]);

    const { onCreated, onOpenChange } = renderDialog();

    const [name, education] = screen.getAllByRole("textbox");
    await user.type(name, "Senior CV");
    await user.type(education, "BSc");
    await user.type(screen.getAllByRole("textbox")[2], "Backend");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() =>
      expect(createCv).toHaveBeenCalledWith({
        variables: {
          cv: { name: "Senior CV", education: "BSc", description: "Backend", userId: "u1" },
        },
      }),
    );
    expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: "c3" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("submits null education when the field is left empty", async () => {
    const user = userEvent.setup();
    const createCv = jest.fn().mockResolvedValue({
      data: {
        createCv: {
          id: "c3",
          created_at: "",
          name: "Senior CV",
          education: null,
          description: "Backend",
        },
      },
    });
    mockUseMutation.mockReturnValue([createCv, { loading: false }]);
    renderDialog();

    const [name, , description] = screen.getAllByRole("textbox");
    await user.type(name, "Senior CV");
    await user.type(description, "Backend");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() =>
      expect(createCv).toHaveBeenCalledWith({
        variables: {
          cv: { name: "Senior CV", education: null, description: "Backend", userId: "u1" },
        },
      }),
    );
  });

  it("keeps the dialog open when the mutation fails", async () => {
    const user = userEvent.setup();
    const createCv = jest.fn().mockRejectedValue(new Error("boom"));
    mockUseMutation.mockReturnValue([createCv, { loading: false }]);

    const { onOpenChange } = renderDialog();

    const [name, , description] = screen.getAllByRole("textbox");
    await user.type(name, "Senior CV");
    await user.type(description, "Backend");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => expect(createCv).toHaveBeenCalled());
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("DeleteCvDialog", () => {
  const target = {
    id: "c1",
    created_at: "",
    name: "Senior CV",
    education: null,
    description: "Backend",
    user: null,
  };

  it("sends the cv id and notifies onDeleted", async () => {
    const user = userEvent.setup();
    const deleteCv = jest.fn().mockResolvedValue({ data: { deleteCv: { affected: 1 } } });
    mockUseMutation.mockReturnValue([deleteCv, { loading: false }]);

    const onDeleted = jest.fn();
    const onClose = jest.fn();
    render(<DeleteCvDialog target={target} onClose={onClose} onDeleted={onDeleted} />);

    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() =>
      expect(deleteCv).toHaveBeenCalledWith({ variables: { cv: { cvId: "c1" } } }),
    );
    expect(onDeleted).toHaveBeenCalledWith("c1");
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps the dialog open when the deletion fails", async () => {
    const user = userEvent.setup();
    const deleteCv = jest.fn().mockRejectedValue(new Error("boom"));
    mockUseMutation.mockReturnValue([deleteCv, { loading: false }]);

    const onDeleted = jest.fn();
    const onClose = jest.fn();
    render(<DeleteCvDialog target={target} onClose={onClose} onDeleted={onDeleted} />);

    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() => expect(deleteCv).toHaveBeenCalled());
    expect(onDeleted).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
