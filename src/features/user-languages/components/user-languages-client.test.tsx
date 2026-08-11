import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserLanguagesClient } from "./user-languages-client";
import { useQuery, useMutation } from "@apollo/client/react";
import { usePermissions } from "@/lib/auth/permissions";
import { toast } from "sonner";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@apollo/client/react", () => ({ useQuery: jest.fn(), useMutation: jest.fn() }));
jest.mock("@/lib/auth/permissions", () => ({ usePermissions: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockUseMutation = useMutation as unknown as jest.Mock;
const mockUsePermissions = usePermissions as unknown as jest.Mock;
const mockToastSuccess = toast.success as unknown as jest.Mock;

function operationName(doc: unknown): string {
  return (
    (doc as { definitions?: Array<{ name?: { value?: string } }> }).definitions?.[0]?.name?.value ??
    ""
  );
}

const user = {
  id: "u1",
  created_at: "1700000000",
  email: "a@b.com",
  is_verified: true,
  role: "Employee" as const,
  department_name: null,
  position_name: null,
  profile: {
    id: "p1",
    created_at: "",
    first_name: "A",
    last_name: "B",
    full_name: "A B",
    avatar: null,
    skills: [],
    languages: [
      { name: "English", proficiency: "C1" as const },
      { name: "German", proficiency: "B1" as const },
    ],
  },
  department: null,
  position: null,
  cvs: [],
};

const allLanguages = [
  { id: "1", created_at: "", iso2: "en", name: "English", native_name: "English" },
  { id: "2", created_at: "", iso2: "de", name: "German", native_name: "Deutsch" },
  { id: "3", created_at: "", iso2: "fr", name: "French", native_name: "Français" },
];

let addLanguage: jest.Mock;
let updateLanguage: jest.Mock;
let deleteLanguages: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  addLanguage = jest.fn().mockResolvedValue({});
  updateLanguage = jest.fn().mockResolvedValue({});
  deleteLanguages = jest.fn().mockResolvedValue({});
  mockUseMutation.mockImplementation((doc: unknown) => {
    const name = operationName(doc);
    if (name === "AddProfileLanguage") return [addLanguage, { loading: false }];
    if (name === "UpdateProfileLanguage") return [updateLanguage, { loading: false }];
    return [deleteLanguages, { loading: false }];
  });
  mockUseQuery.mockImplementation((doc: unknown) => {
    const name = operationName(doc);
    if (name === "User") return { data: { user }, loading: false };
    return { data: { languages: allLanguages }, loading: false };
  });
  mockUsePermissions.mockReturnValue({ canEdit: true });
});

function renderClient(initialUser: typeof user | null = null) {
  return render(<UserLanguagesClient userId="u1" initialUser={initialUser} />);
}

describe("UserLanguagesClient", () => {
  it("shows the loading state when the query is loading and no user is available", () => {
    mockUseQuery.mockImplementation((doc: unknown) => {
      if (operationName(doc) === "User") return { data: undefined, loading: true };
      return { data: { languages: allLanguages }, loading: false };
    });
    renderClient(null);
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("renders the empty state when there are no languages", () => {
    mockUseQuery.mockImplementation((doc: unknown) => {
      if (operationName(doc) === "User") {
        return {
          data: { user: { ...user, profile: { ...user.profile, languages: [] } } },
          loading: false,
        };
      }
      return { data: { languages: allLanguages }, loading: false };
    });
    renderClient();
    expect(screen.getByText("noLanguagesAssigned")).toBeInTheDocument();
  });

  it("renders the language list with proficiency levels", () => {
    renderClient();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("German")).toBeInTheDocument();
    expect(screen.getByText("C1")).toBeInTheDocument();
    expect(screen.getByText("B1")).toBeInTheDocument();
  });

  it("shows the add and remove action buttons for users with edit permission", () => {
    renderClient();
    expect(screen.getByText(/addLanguage/)).toBeInTheDocument();
    expect(screen.getByText(/removeLanguages/)).toBeInTheDocument();
  });

  it("hides the action buttons for users without edit permission", () => {
    mockUsePermissions.mockReturnValue({ canEdit: false });
    renderClient();
    expect(screen.queryByText(/addLanguage/)).not.toBeInTheDocument();
    expect(screen.queryByText(/removeLanguages/)).not.toBeInTheDocument();
  });

  it("enters and exits remove mode", async () => {
    const user = userEvent.setup();
    renderClient();
    await user.click(screen.getByText(/removeLanguages/));
    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("delete")).toBeInTheDocument();
    await user.click(screen.getByText("cancel"));
    expect(screen.getByText(/addLanguage/)).toBeInTheDocument();
  });

  it("selects languages in remove mode and deletes them", async () => {
    const user = userEvent.setup();
    renderClient();
    await user.click(screen.getByText(/removeLanguages/));
    await user.click(screen.getByText("English"));
    await user.click(screen.getByText("delete"));
    await waitFor(() => {
      expect(deleteLanguages).toHaveBeenCalledWith({
        variables: { language: { userId: "u1", name: ["English"] } },
      });
    });
    expect(mockToastSuccess).toHaveBeenCalledWith("languagesDeletedSuccess");
  });

  it("shows the count badge on the delete button when languages are selected", async () => {
    const user = userEvent.setup();
    renderClient();
    await user.click(screen.getByText(/removeLanguages/));
    await user.click(screen.getByText("English"));
    await user.click(screen.getByText("German"));
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
