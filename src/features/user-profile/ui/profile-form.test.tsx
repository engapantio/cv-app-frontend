import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "./profile-form";
import { useMutation, useQuery, useApolloClient } from "@apollo/client/react";
import { toast } from "sonner";
import { syncSessionProfileFromUpdate } from "@/lib/auth/session";
import { buildUserUpdateOperations } from "@/lib/user-updates";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@apollo/client/react", () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
  useApolloClient: jest.fn(),
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/lib/auth/session", () => ({ syncSessionProfileFromUpdate: jest.fn() }));
jest.mock("@/lib/user-updates", () => ({ buildUserUpdateOperations: jest.fn() }));
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const mockUseMutation = useMutation as unknown as jest.Mock;
const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseApolloClient = useApolloClient as unknown as jest.Mock;
const mockToastSuccess = toast.success as unknown as jest.Mock;
const mockToastError = toast.error as unknown as jest.Mock;
const mockSync = syncSessionProfileFromUpdate as unknown as jest.Mock;
const mockBuildOps = buildUserUpdateOperations as unknown as jest.Mock;

const departments = [
  { id: "d1", name: "Engineering" },
  { id: "d2", name: "Design" },
];
const positions = [
  { id: "p1", name: "Engineer" },
  { id: "p2", name: "Designer" },
];

function operationName(doc: unknown): string {
  return (
    (doc as { definitions?: Array<{ name?: { value?: string } }> }).definitions?.[0]?.name?.value ??
    ""
  );
}

let updateUser: jest.Mock;
let updateProfile: jest.Mock;
let refetchQueries: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  updateUser = jest.fn().mockResolvedValue({});
  updateProfile = jest.fn().mockResolvedValue({});
  refetchQueries = jest.fn().mockResolvedValue({});
  mockUseApolloClient.mockReturnValue({ refetchQueries });
  mockUseMutation.mockImplementation((doc: unknown) => {
    const name = operationName(doc);
    if (name === "UpdateUser") return [updateUser, { loading: false }];
    return [updateProfile, { loading: false }];
  });
  mockUseQuery.mockImplementation((doc: unknown) => {
    const name = operationName(doc);
    if (name === "Departments") return { data: { departments } };
    return { data: { positions } };
  });
  mockBuildOps.mockReturnValue([{ run: jest.fn().mockResolvedValue({}) }]);
});

const defaultValues = {
  first_name: "Alice",
  last_name: "Smith",
  departmentId: "d1",
  positionId: "p1",
};

function renderForm({
  isOwner = true,
  isSelf = true,
  userDepartmentName = "Engineering",
  userPositionName = "Engineer",
}: {
  isOwner?: boolean;
  isSelf?: boolean;
  userDepartmentName?: string | null;
  userPositionName?: string | null;
} = {}) {
  return render(
    <ProfileForm
      userId="u1"
      defaultValues={defaultValues}
      userDepartmentName={userDepartmentName}
      userPositionName={userPositionName}
      isOwner={isOwner}
      isSelf={isSelf}
    />,
  );
}

describe("ProfileForm", () => {
  it("renders the name fields populated from default values", () => {
    renderForm();
    expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Smith")).toBeInTheDocument();
  });

  it("renders the department and position options", () => {
    renderForm();
    expect(screen.getAllByText("Engineering").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Engineer").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
  });

  it("disables the fields and hides the submit button for non-owners", () => {
    renderForm({ isOwner: false });
    expect(screen.getByDisplayValue("Alice")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "update" })).not.toBeInTheDocument();
  });

  it("keeps the submit button disabled until the form is dirty", async () => {
    const user = userEvent.setup();
    renderForm();
    const submit = screen.getByRole("button", { name: "update" });
    expect(submit).toBeDisabled();
    await user.clear(screen.getByDisplayValue("Alice"));
    await user.type(screen.getByDisplayValue(""), "Alicia");
    await waitFor(() => expect(submit).toBeEnabled());
  });

  it("submits the changed fields, refetches and shows a success toast", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.clear(screen.getByDisplayValue("Alice"));
    await user.type(screen.getByDisplayValue(""), "Alicia");
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() => expect(mockBuildOps).toHaveBeenCalled());
    expect(mockBuildOps).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        first_name: "Alicia",
        last_name: "Smith",
        departmentId: "d1",
        positionId: "p1",
      }),
      expect.objectContaining({
        first_name: "Alice",
        last_name: "Smith",
        departmentId: "d1",
        positionId: "p1",
      }),
      expect.objectContaining({ updateProfile, updateUser }),
    );
    expect(refetchQueries).toHaveBeenCalledWith({ include: [expect.anything()] });
    expect(mockSync).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: "Alicia",
        department: { id: "d1", name: "Engineering" },
        position: { id: "p1", name: "Engineer" },
      }),
    );
    expect(mockToastSuccess).toHaveBeenCalledWith("Profile updated successfully");
  });

  it("does not sync the session profile when viewing someone else", async () => {
    const user = userEvent.setup();
    renderForm({ isSelf: false });
    await user.clear(screen.getByDisplayValue("Alice"));
    await user.type(screen.getByDisplayValue(""), "Alicia");
    await user.click(screen.getByRole("button", { name: "update" }));
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalled());
    expect(mockSync).not.toHaveBeenCalled();
  });

  it("shows an error toast when an operation fails", async () => {
    const user = userEvent.setup();
    mockBuildOps.mockReturnValue([{ run: jest.fn().mockRejectedValue(new Error("boom")) }]);
    renderForm();
    await user.clear(screen.getByDisplayValue("Alice"));
    await user.type(screen.getByDisplayValue(""), "Alicia");
    await user.click(screen.getByRole("button", { name: "update" }));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("boom"));
  });

  it("does nothing when there are no changes to apply", async () => {
    const user = userEvent.setup();
    mockBuildOps.mockReturnValue([]);
    renderForm();
    await user.clear(screen.getByDisplayValue("Alice"));
    await user.type(screen.getByDisplayValue(""), "Alicia");
    await user.click(screen.getByRole("button", { name: "update" }));
    await waitFor(() => expect(mockBuildOps).toHaveBeenCalled());
    expect(refetchQueries).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it("selects a new department from the options", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByText("Design"));
    await user.click(screen.getByRole("button", { name: "update" }));
    await waitFor(() => expect(mockBuildOps).toHaveBeenCalled());
    expect(mockBuildOps).toHaveBeenCalledWith(
      expect.objectContaining({ departmentId: "d2" }),
      expect.anything(),
      expect.anything(),
    );
  });
});
