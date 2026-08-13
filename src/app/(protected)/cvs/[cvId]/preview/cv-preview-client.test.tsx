import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CvPreviewClient } from "./cv-preview-client";
import { useMutation } from "@apollo/client/react";
import { usePermissions } from "@/lib/auth/permissions";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));
jest.mock("@/lib/auth/permissions", () => ({ usePermissions: jest.fn() }));

const mockToast = jest.fn();
jest.mock("sonner", () => ({
  get toast() {
    return mockToast;
  },
}));

const mockUseMutation = useMutation as unknown as jest.Mock;
const mockUsePermissions = usePermissions as unknown as jest.Mock;

const cv = {
  id: "cv1",
  created_at: "1700000000",
  name: "Senior CV",
  education: "BSc",
  description: "Backend CV description",
  user: {
    id: "owner-1",
    email: "owner@b.com",
    position_name: "Developer",
    profile: {
      id: "p1",
      full_name: "Owner One",
      avatar: null,
      languages: [{ name: "English", proficiency: "C1" as const }],
    },
  },
  projects: [
    {
      id: "pj1",
      name: "Alpha",
      internal_name: "alpha",
      description: "A project",
      domain: "Web",
      start_date: "2024-01-01",
      end_date: null,
      environment: ["React"],
      roles: ["Lead"],
      responsibilities: ["Ship it"],
      project: { id: "prj1", name: "Alpha", internal_name: "alpha" },
    },
  ],
  skills: [
    { name: "TypeScript", mastery: "Expert" as const, categoryId: "c1" },
    { name: "Rust", mastery: "Proficient" as const, categoryId: "c1" },
  ],
  languages: [],
} as never;

const skillCategories = [{ id: "c1", name: "Development" }] as never;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn().mockResolvedValue({}), { loading: false }]);
  mockUsePermissions.mockReturnValue({ currentUserId: "owner-1", isAdmin: false });
});

function renderPreview() {
  return render(
    <CvPreviewClient
      initialCv={cv}
      skillCategories={skillCategories}
      serverError={null}
      years={3}
      lastUsed={2025}
    />,
  );
}

describe("CvPreviewClient export permissions", () => {
  it("shows the export button to the CV owner", () => {
    mockUsePermissions.mockReturnValue({ currentUserId: "owner-1", isAdmin: false });
    renderPreview();
    expect(screen.getByText("exportPdf")).toBeInTheDocument();
  });

  it("shows the export button to admins viewing another user's CV", () => {
    mockUsePermissions.mockReturnValue({ currentUserId: "admin-1", isAdmin: true });
    renderPreview();
    expect(screen.getByText("exportPdf")).toBeInTheDocument();
  });

  it("hides the export button for regular users viewing another user's CV", () => {
    mockUsePermissions.mockReturnValue({ currentUserId: "someone-else", isAdmin: false });
    renderPreview();
    expect(screen.queryByText("exportPdf")).not.toBeInTheDocument();
  });
});

describe("CvPreviewClient rendering", () => {
  it("renders the owner name, position and CV details", () => {
    renderPreview();
    expect(screen.getByText("Owner One")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.getByText("Senior CV")).toBeInTheDocument();
    expect(screen.getByText("Backend CV description")).toBeInTheDocument();
    expect(screen.getByText("BSc")).toBeInTheDocument();
  });

  it("renders the language proficiency list", () => {
    renderPreview();
    expect(screen.getByText(/English/)).toBeInTheDocument();
    expect(screen.getByText(/C1/)).toBeInTheDocument();
  });

  it("groups skills under their category name", () => {
    renderPreview();
    expect(screen.getAllByText("Development").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("TypeScript, Rust.")).toBeInTheDocument();
  });

  it("renders the projects section with project details", () => {
    renderPreview();
    expect(screen.getByText("projects")).toBeInTheDocument();
    expect(screen.getByText("ALPHA")).toBeInTheDocument();
    expect(screen.getByText("A project")).toBeInTheDocument();
    expect(screen.getByText("React.")).toBeInTheDocument();
  });

  it("renders the professional skills table", () => {
    renderPreview();
    expect(screen.getByText("professionalSkills")).toBeInTheDocument();
    expect(screen.getByText("skills")).toBeInTheDocument();
  });

  it("renders the server error instead of the preview", () => {
    render(
      <CvPreviewClient
        initialCv={cv}
        skillCategories={[]}
        serverError="Failed to load CV"
        years={null}
        lastUsed={null}
      />,
    );
    expect(screen.getByText("Failed to load CV")).toBeInTheDocument();
  });

  it("renders the loading message when there is no cv", () => {
    render(
      <CvPreviewClient
        initialCv={null}
        skillCategories={[]}
        serverError={null}
        years={null}
        lastUsed={null}
      />,
    );
    expect(screen.getByText("loading")).toBeInTheDocument();
  });
});

describe("CvPreviewClient pdf export", () => {
  it("calls the export mutation with the rendered html and shows a success toast", async () => {
    const user = userEvent.setup();
    const exportPdf = jest.fn().mockResolvedValue({ data: { exportPdf: "aGVsbG8=" } });
    mockUseMutation.mockReturnValue([exportPdf, { loading: false }]);

    const createObjectURL = jest.fn(() => "blob:mock");
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, writable: true });
    Object.defineProperty(URL, "revokeObjectURL", { value: revokeObjectURL, writable: true });

    renderPreview();
    await user.click(screen.getByText("exportPdf"));

    await waitFor(() =>
      expect(exportPdf).toHaveBeenCalledWith({
        variables: {
          pdf: expect.objectContaining({
            html: expect.stringContaining("Owner One"),
            margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
          }),
        },
      }),
    );
    expect(mockToast).toHaveBeenCalledWith("pdfExportSuccess");
  });

  it("shows an error toast when the export fails", async () => {
    const user = userEvent.setup();
    const exportPdf = jest.fn().mockRejectedValue(new Error("boom"));
    mockUseMutation.mockReturnValue([exportPdf, { loading: false }]);

    Object.defineProperty(URL, "createObjectURL", { value: jest.fn(), writable: true });

    renderPreview();
    await user.click(screen.getByText("exportPdf"));

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith("pdfExportFailed"));
  });
});
