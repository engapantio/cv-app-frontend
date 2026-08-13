import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CvDetailsClient from "./details-client";
import { useMutation } from "@apollo/client/react";
import { usePermissions } from "@/lib/auth/permissions";
import { makeCv } from "@/test-utils/cv-fixtures";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));
jest.mock("@/lib/auth/permissions", () => ({ usePermissions: jest.fn() }));
jest.mock("sonner", () => ({
  get toast() {
    return mockToast;
  },
}));
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/input", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/textarea", () => require("@/test-utils/ui-mock"));

const mockUseMutation = useMutation as unknown as jest.Mock;
const mockUsePermissions = usePermissions as unknown as jest.Mock;
const mockToast = jest.fn();

const cv = makeCv({ name: "Senior CV", education: "BSc", description: "Backend CV" });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn().mockResolvedValue({}), { loading: false }]);
  mockUsePermissions.mockReturnValue({ canEdit: true });
});

describe("CvDetailsClient", () => {
  it("renders the server error instead of the form", () => {
    render(<CvDetailsClient cvId="cv1" initialCv={null} serverError="Failed to load CV" />);
    expect(screen.getByText("Failed to load CV")).toBeInTheDocument();
  });

  it("renders the loading message when there is no initial cv", () => {
    render(<CvDetailsClient cvId="cv1" initialCv={null} serverError={null} />);
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("prefills the form with the cv values", () => {
    render(<CvDetailsClient cvId="cv1" initialCv={cv} serverError={null} />);
    const [name, education, description] = screen.getAllByRole("textbox");
    expect(name).toHaveValue("Senior CV");
    expect(education).toHaveValue("BSc");
    expect(description).toHaveValue("Backend CV");
  });

  it("keeps the update button disabled until a field changes", async () => {
    const user = userEvent.setup();
    render(<CvDetailsClient cvId="cv1" initialCv={cv} serverError={null} />);
    expect(screen.getByRole("button", { name: "update" })).toBeDisabled();
    const [name] = screen.getAllByRole("textbox");
    await user.clear(name);
    await user.type(name, "Renamed CV");
    expect(screen.getByRole("button", { name: "update" })).toBeEnabled();
  });

  it("submits the changed fields with the cv id and shows a success toast", async () => {
    const user = userEvent.setup();
    const updateCv = jest.fn().mockResolvedValue({
      data: {
        updateCv: {
          id: "cv1",
          created_at: "",
          name: "Renamed CV",
          education: "BSc",
          description: "Backend CV",
        },
      },
    });
    mockUseMutation.mockReturnValue([updateCv, { loading: false }]);
    render(<CvDetailsClient cvId="cv1" initialCv={cv} serverError={null} />);

    const [name] = screen.getAllByRole("textbox");
    await user.clear(name);
    await user.type(name, "Renamed CV");
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() =>
      expect(updateCv).toHaveBeenCalledWith({
        variables: {
          cv: { cvId: "cv1", name: "Renamed CV", education: "BSc", description: "Backend CV" },
        },
      }),
    );
    expect(mockToast).toHaveBeenCalledWith("updateCvSuccess");
  });

  it("submits null education when cleared", async () => {
    const user = userEvent.setup();
    const updateCv = jest.fn().mockResolvedValue({
      data: {
        updateCv: {
          id: "cv1",
          created_at: "",
          name: "Senior CV",
          education: null,
          description: "Backend CV",
        },
      },
    });
    mockUseMutation.mockReturnValue([updateCv, { loading: false }]);
    render(<CvDetailsClient cvId="cv1" initialCv={cv} serverError={null} />);

    const [, education] = screen.getAllByRole("textbox");
    await user.clear(education);
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() =>
      expect(updateCv).toHaveBeenCalledWith({
        variables: {
          cv: { cvId: "cv1", name: "Senior CV", education: null, description: "Backend CV" },
        },
      }),
    );
  });

  it("shows an error toast when the update fails", async () => {
    const user = userEvent.setup();
    const updateCv = jest.fn().mockRejectedValue(new Error("boom"));
    mockUseMutation.mockReturnValue([updateCv, { loading: false }]);
    render(<CvDetailsClient cvId="cv1" initialCv={cv} serverError={null} />);

    const [name] = screen.getAllByRole("textbox");
    await user.clear(name);
    await user.type(name, "Renamed CV");
    await user.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() => expect(updateCv).toHaveBeenCalled());
    expect(mockToast).toHaveBeenCalledWith("updateCvFailed");
  });

  it("shows validation errors for missing required fields", async () => {
    const user = userEvent.setup();
    const updateCv = jest.fn().mockResolvedValue({});
    mockUseMutation.mockReturnValue([updateCv, { loading: false }]);
    render(<CvDetailsClient cvId="cv1" initialCv={cv} serverError={null} />);

    const [name, , description] = screen.getAllByRole("textbox");
    await user.clear(name);
    await user.clear(description);
    await user.click(screen.getByRole("button", { name: "update" }));

    expect(await screen.findByText("nameRequired")).toBeInTheDocument();
    expect(screen.getByText("descriptionRequired")).toBeInTheDocument();
    expect(updateCv).not.toHaveBeenCalled();
  });

  it("renders the form read-only and disables update for non-owners", () => {
    mockUsePermissions.mockReturnValue({ canEdit: false });
    render(<CvDetailsClient cvId="cv1" initialCv={cv} serverError={null} />);
    const [name] = screen.getAllByRole("textbox");
    expect(name).toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: "update" })).toBeDisabled();
  });
});
