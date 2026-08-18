import { Suspense } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectDetailPage from "./page";
import { useQuery, useMutation } from "@apollo/client/react";
import { usePermissions } from "@/lib/auth/permissions";

jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn(), useMutation: jest.fn() }));
jest.mock("@/lib/auth/permissions", () => ({ usePermissions: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/input", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared/pill", () => ({
  Pill: ({ text }: { text: string }) => <span>{text}</span>,
}));
jest.mock("@/features/projects/components/update-project-dialog", () => ({
  UpdateProjectDialog: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open ? (
      <div data-testid="update-dialog">
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
}));

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseMutation = useMutation as unknown as jest.Mock;
const mockUsePermissions = usePermissions as unknown as jest.Mock;

function resolvedParams(value: { projectId: string }) {
  const thenable: Promise<{ projectId: string }> & {
    status: string;
    value: { projectId: string };
  } = {
    then: (resolve: (v: { projectId: string }) => void) => resolve(value),
    status: "fulfilled",
    value,
  } as never;
  return thenable;
}

const project = {
  id: "p1",
  created_at: "2024-01-01T00:00:00Z",
  name: "Beta",
  internal_name: "beta",
  domain: "Mobile",
  start_date: "2023-05-01",
  end_date: "2023-12-01",
  description: "A mobile project",
  environment: ["Kotlin", "Swift"],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseQuery.mockReturnValue({ data: { project }, loading: false, error: null });
  mockUseMutation.mockReturnValue([jest.fn().mockResolvedValue({}), { loading: false }]);
  mockUsePermissions.mockReturnValue({ isAdmin: false });
});

function renderPage() {
  return render(
    <Suspense fallback={<div>loading...</div>}>
      <ProjectDetailPage params={resolvedParams({ projectId: "p1" })} />
    </Suspense>,
  );
}

describe("ProjectDetailPage", () => {
  it("renders the loading state", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: true, error: null });
    renderPage();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders the error state", () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: false, error: new Error("fail") });
    renderPage();
    expect(screen.getByText("Project not found")).toBeInTheDocument();
  });

  it("renders not found when project is null", () => {
    mockUseQuery.mockReturnValue({ data: { project: null }, loading: false, error: null });
    renderPage();
    expect(screen.getByText("Project not found")).toBeInTheDocument();
  });

  it("displays the project fields", () => {
    renderPage();
    expect(screen.getByDisplayValue("Beta")).toBeInTheDocument();
    expect(screen.getByDisplayValue("beta")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mobile")).toBeInTheDocument();
    expect(screen.getByDisplayValue("01/05/2023")).toBeInTheDocument();
    expect(screen.getByDisplayValue("01/12/2023")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Till now")).not.toBeInTheDocument();
    expect(screen.getByText("Kotlin")).toBeInTheDocument();
    expect(screen.getByText("Swift")).toBeInTheDocument();
  });

  it("renders till now for a null end date", () => {
    mockUseQuery.mockReturnValue({
      data: { project: { ...project, end_date: null } },
      loading: false,
      error: null,
    });
    renderPage();
    expect(screen.getByDisplayValue("Till now")).toBeInTheDocument();
  });

  it("calls useQuery with the project id", () => {
    renderPage();
    expect(mockUseQuery).toHaveBeenCalledWith(expect.anything(), {
      variables: { projectId: "p1" },
      fetchPolicy: "cache-and-network",
      errorPolicy: "none",
      skip: false,
    });
  });

  it("hides the update button for non-admins", () => {
    renderPage();
    expect(screen.queryByRole("button", { name: /update/i })).not.toBeInTheDocument();
  });

  it("shows the update button and dialog for admins", async () => {
    mockUsePermissions.mockReturnValue({ isAdmin: true });
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /update/i }));
    expect(screen.getByTestId("update-dialog")).toBeInTheDocument();
  });

  it("handles the update mutation and shows a success toast", async () => {
    const user = userEvent.setup();
    const updateProject = jest.fn().mockResolvedValue({ data: {} });
    mockUseMutation.mockReturnValue([updateProject, { loading: false }]);
    mockUsePermissions.mockReturnValue({ isAdmin: true });
    renderPage();
    await user.click(screen.getByRole("button", { name: /update/i }));
    await user.click(screen.getByText("Confirm"));
    await waitFor(() => expect(updateProject).toHaveBeenCalled());
    expect(require("sonner").toast.success).toHaveBeenCalledWith("projectUpdatedSuccess");
  });

  it("shows an error toast when the update fails", async () => {
    const user = userEvent.setup();
    const updateProject = jest.fn().mockRejectedValue(new Error("boom"));
    mockUseMutation.mockReturnValue([updateProject, { loading: false }]);
    mockUsePermissions.mockReturnValue({ isAdmin: true });
    renderPage();
    await user.click(screen.getByRole("button", { name: /update/i }));
    await user.click(screen.getByText("Confirm"));
    await waitFor(() => expect(updateProject).toHaveBeenCalled());
    expect(require("sonner").toast.error).toHaveBeenCalledWith("updateProjectFailed");
  });
});
