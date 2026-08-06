import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation } from "@apollo/client/react";
import { CreatePositionDialog } from "./create-position-dialog";
import { UpdatePositionDialog } from "./update-position-dialog";
import { DeletePositionDialog } from "./delete-position-dialog";
import type { PositionItem } from "../types";

jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const mockUseMutation = useMutation as unknown as jest.Mock;

const mockToastError = jest.fn();

jest.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const target: PositionItem = {
  id: "7",
  created_at: "2024-01-01T00:00:00Z",
  name: "Backend Developer",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
});

describe("CreatePositionDialog", () => {
  it("disables submit until a name is provided", async () => {
    const user = userEvent.setup();
    render(<CreatePositionDialog open onOpenChange={jest.fn()} onCreated={jest.fn()} />);
    expect(screen.getByRole("button", { name: "create" })).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "QA Engineer");
    expect(screen.getByRole("button", { name: "create" })).toBeEnabled();
  });

  it("submits the trimmed name and notifies onCreated", async () => {
    const user = userEvent.setup();
    const createPosition = jest.fn().mockResolvedValue({
      data: { createPosition: { id: "9", created_at: "", name: "QA Engineer" } },
    });
    mockUseMutation.mockReturnValue([createPosition, { loading: false }]);

    const onCreated = jest.fn();
    const onOpenChange = jest.fn();
    render(<CreatePositionDialog open onOpenChange={onOpenChange} onCreated={onCreated} />);

    await user.type(screen.getByRole("textbox"), "  QA Engineer  ");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() =>
      expect(createPosition).toHaveBeenCalledWith({
        variables: { position: { name: "QA Engineer" } },
      }),
    );
    expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: "9" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows a toast and does not close when the mutation fails", async () => {
    const user = userEvent.setup();
    const createPosition = jest.fn().mockRejectedValue(new Error("network"));
    mockUseMutation.mockReturnValue([createPosition, { loading: false }]);

    const onOpenChange = jest.fn();
    render(<CreatePositionDialog open onOpenChange={onOpenChange} onCreated={jest.fn()} />);

    await user.type(screen.getByRole("textbox"), "QA Engineer");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("createPositionFailed"));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("UpdatePositionDialog", () => {
  it("prefills the form with existing values", () => {
    render(<UpdatePositionDialog target={target} onClose={jest.fn()} onUpdated={jest.fn()} />);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("Backend Developer");
  });

  it("disables submit when nothing changed", () => {
    render(<UpdatePositionDialog target={target} onClose={jest.fn()} onUpdated={jest.fn()} />);
    expect(screen.getByRole("button", { name: "update" })).toBeDisabled();
  });

  it("submits the positionId and updated name", async () => {
    const user = userEvent.setup();
    const updatePosition = jest.fn().mockResolvedValue({
      data: { updatePosition: { id: "7", created_at: "", name: "Backend Engineer" } },
    });
    mockUseMutation.mockReturnValue([updatePosition, { loading: false }]);

    const onUpdated = jest.fn();
    const onClose = jest.fn();
    render(<UpdatePositionDialog target={target} onClose={onClose} onUpdated={onUpdated} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Backend Engineer");
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() =>
      expect(updatePosition).toHaveBeenCalledWith({
        variables: { position: { positionId: "7", name: "Backend Engineer" } },
      }),
    );
    expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ id: "7" }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("DeletePositionDialog", () => {
  it("sends the positionId and notifies onDeleted", async () => {
    const user = userEvent.setup();
    const deletePosition = jest
      .fn()
      .mockResolvedValue({ data: { deletePosition: { affected: 1 } } });
    mockUseMutation.mockReturnValue([deletePosition, { loading: false }]);

    const onDeleted = jest.fn();
    const onClose = jest.fn();
    render(<DeletePositionDialog target={target} onClose={onClose} onDeleted={onDeleted} />);

    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() =>
      expect(deletePosition).toHaveBeenCalledWith({
        variables: { position: { positionId: "7" } },
      }),
    );
    expect(onDeleted).toHaveBeenCalledWith("7");
    expect(onClose).toHaveBeenCalled();
  });
});
