import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation } from "@apollo/client/react";
import { CreateDepartmentDialog } from "./create-department-dialog";
import { UpdateDepartmentDialog } from "./update-department-dialog";
import { DeleteDepartmentDialog } from "./delete-department-dialog";
import type { DepartmentItem } from "../types";

jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const mockUseMutation = useMutation as unknown as jest.Mock;

const mockToastError = jest.fn();

jest.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

const target: DepartmentItem = {
  id: "7",
  created_at: "2024-01-01T00:00:00Z",
  name: "Engineering",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn(), { loading: false }]);
});

describe("CreateDepartmentDialog", () => {
  it("disables submit until a name is provided", async () => {
    const user = userEvent.setup();
    render(<CreateDepartmentDialog open onOpenChange={jest.fn()} onCreated={jest.fn()} />);
    expect(screen.getByRole("button", { name: "create" })).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "HR");
    expect(screen.getByRole("button", { name: "create" })).toBeEnabled();
  });

  it("submits the trimmed name and notifies onCreated", async () => {
    const user = userEvent.setup();
    const createDepartment = jest.fn().mockResolvedValue({
      data: { createDepartment: { id: "9", created_at: "", name: "HR" } },
    });
    mockUseMutation.mockReturnValue([createDepartment, { loading: false }]);

    const onCreated = jest.fn();
    const onOpenChange = jest.fn();
    render(<CreateDepartmentDialog open onOpenChange={onOpenChange} onCreated={onCreated} />);

    await user.type(screen.getByRole("textbox"), "  HR  ");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() =>
      expect(createDepartment).toHaveBeenCalledWith({
        variables: { department: { name: "HR" } },
      }),
    );
    expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: "9" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows a toast and does not close when the mutation fails", async () => {
    const user = userEvent.setup();
    const createDepartment = jest.fn().mockRejectedValue(new Error("network"));
    mockUseMutation.mockReturnValue([createDepartment, { loading: false }]);

    const onOpenChange = jest.fn();
    render(<CreateDepartmentDialog open onOpenChange={onOpenChange} onCreated={jest.fn()} />);

    await user.type(screen.getByRole("textbox"), "HR");
    await user.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("createDepartmentFailed"));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("UpdateDepartmentDialog", () => {
  it("prefills the form with existing values", () => {
    render(<UpdateDepartmentDialog target={target} onClose={jest.fn()} onUpdated={jest.fn()} />);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("Engineering");
  });

  it("disables submit when nothing changed", () => {
    render(<UpdateDepartmentDialog target={target} onClose={jest.fn()} onUpdated={jest.fn()} />);
    expect(screen.getByRole("button", { name: "update" })).toBeDisabled();
  });

  it("submits the departmentId and updated name", async () => {
    const user = userEvent.setup();
    const updateDepartment = jest.fn().mockResolvedValue({
      data: { updateDepartment: { id: "7", created_at: "", name: "Core Engineering" } },
    });
    mockUseMutation.mockReturnValue([updateDepartment, { loading: false }]);

    const onUpdated = jest.fn();
    const onClose = jest.fn();
    render(<UpdateDepartmentDialog target={target} onClose={onClose} onUpdated={onUpdated} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Core Engineering");
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() =>
      expect(updateDepartment).toHaveBeenCalledWith({
        variables: { department: { departmentId: "7", name: "Core Engineering" } },
      }),
    );
    expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ id: "7" }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("DeleteDepartmentDialog", () => {
  it("sends the departmentId and notifies onDeleted", async () => {
    const user = userEvent.setup();
    const deleteDepartment = jest
      .fn()
      .mockResolvedValue({ data: { deleteDepartment: { affected: 1 } } });
    mockUseMutation.mockReturnValue([deleteDepartment, { loading: false }]);

    const onDeleted = jest.fn();
    const onClose = jest.fn();
    render(<DeleteDepartmentDialog target={target} onClose={onClose} onDeleted={onDeleted} />);

    await user.click(screen.getByRole("button", { name: "confirm" }));

    await waitFor(() =>
      expect(deleteDepartment).toHaveBeenCalledWith({
        variables: { department: { departmentId: "7" } },
      }),
    );
    expect(onDeleted).toHaveBeenCalledWith("7");
    expect(onClose).toHaveBeenCalled();
  });
});
