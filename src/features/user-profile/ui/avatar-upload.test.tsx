import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvatarUpload } from "./avatar-upload";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { updateSessionProfile } from "@/lib/auth/session";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/lib/auth/session", () => ({ updateSessionProfile: jest.fn() }));
jest.mock("@/components/ui", () => ({
  ...require("@/test-utils/ui-mock"),
  Avatar: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  AvatarImage: () => null,
  AvatarFallback: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

const mockUseMutation = useMutation as unknown as jest.Mock;
const mockToastSuccess = toast.success as unknown as jest.Mock;
const mockToastError = toast.error as unknown as jest.Mock;
const mockUpdateSessionProfile = updateSessionProfile as unknown as jest.Mock;

class MockFileReader {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  result: string | null = null;
  readAsDataURL() {
    this.result = "data:image/png;base64,QUJD";
    this.onload?.();
  }
}

let uploadAvatar: jest.Mock;
let deleteAvatar: jest.Mock;

function file(size: number, type: string, name = "avatar.png"): File {
  const f = new File(["x"], name, { type });
  Object.defineProperty(f, "size", { value: size });
  return f;
}

function operationName(doc: unknown): string {
  return (
    (doc as { definitions?: Array<{ name?: { value?: string } }> }).definitions?.[0]?.name?.value ??
    ""
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  globalThis.FileReader = MockFileReader as unknown as typeof FileReader;
  uploadAvatar = jest.fn().mockResolvedValue({ data: { uploadAvatar: "http://img/avatar.png" } });
  deleteAvatar = jest.fn().mockResolvedValue({});
  mockUseMutation.mockImplementation((doc: unknown) => {
    const name = operationName(doc);
    if (name === "DeleteAvatar") return [deleteAvatar, { loading: false }];
    return [uploadAvatar, { loading: false }];
  });
});

function renderUpload({
  isOwner = true,
  isSelf = true,
  currentAvatar = null,
}: {
  isOwner?: boolean;
  isSelf?: boolean;
  currentAvatar?: string | null;
} = {}) {
  const utils = render(
    <AvatarUpload
      userId="u1"
      currentAvatar={currentAvatar}
      fullName="Alice Smith"
      isOwner={isOwner}
      isSelf={isSelf}
    />,
  );
  return utils.container.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("AvatarUpload", () => {
  it("renders the initial letter and the upload controls for the owner", () => {
    renderUpload();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("upload")).toBeInTheDocument();
  });

  it("hides the upload controls for non-owners", () => {
    renderUpload({ isOwner: false });
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("upload")).not.toBeInTheDocument();
  });

  it("shows a size error and skips the upload for oversized files", async () => {
    const user = userEvent.setup();
    const input = renderUpload();
    await user.upload(input, file(600 * 1024, "image/png"));
    expect(mockToastError).toHaveBeenCalledWith("avatarTooLarge");
    expect(uploadAvatar).not.toHaveBeenCalled();
  });

  it("shows a type error and skips the upload for unsupported files", async () => {
    const input = renderUpload();
    fireEvent.change(input, { target: { files: [file(1024, "text/plain")] } });
    expect(mockToastError).toHaveBeenCalledWith("avatarInvalidType");
    expect(uploadAvatar).not.toHaveBeenCalled();
  });

  it("uploads the file as base64 and syncs the session when it is self", async () => {
    const user = userEvent.setup();
    const input = renderUpload();
    await user.upload(input, file(1024, "image/png"));
    await waitFor(() => expect(uploadAvatar).toHaveBeenCalled());
    expect(uploadAvatar).toHaveBeenCalledWith({
      variables: { avatar: { userId: "u1", base64: "QUJD", size: 1024, type: "image/png" } },
    });
    expect(mockUpdateSessionProfile).toHaveBeenCalledWith({ avatar: "http://img/avatar.png" });
    expect(mockToastSuccess).toHaveBeenCalledWith("avatarUploadedSuccess");
  });

  it("does not sync the session when the profile is someone else's", async () => {
    const user = userEvent.setup();
    const input = renderUpload({ isSelf: false });
    await user.upload(input, file(1024, "image/jpeg"));
    await waitFor(() => expect(uploadAvatar).toHaveBeenCalled());
    expect(mockUpdateSessionProfile).not.toHaveBeenCalled();
  });

  it("shows an error toast when the upload returns an error", async () => {
    uploadAvatar.mockResolvedValue({ error: { message: "nope" } });
    const user = userEvent.setup();
    const input = renderUpload();
    await user.upload(input, file(1024, "image/png"));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("avatarUploadFailed"));
  });

  it("deletes the avatar and syncs the session when it is self", async () => {
    const user = userEvent.setup();
    renderUpload({ currentAvatar: "http://img/old.png" });
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);
    await waitFor(() => expect(deleteAvatar).toHaveBeenCalled());
    expect(deleteAvatar).toHaveBeenCalledWith({ variables: { avatar: { userId: "u1" } } });
    expect(mockUpdateSessionProfile).toHaveBeenCalledWith({ avatar: null });
    expect(mockToastSuccess).toHaveBeenCalledWith("avatarDeletedSuccess");
  });

  it("shows an error toast when deletion fails", async () => {
    deleteAvatar.mockResolvedValue({ error: { message: "nope" } });
    const user = userEvent.setup();
    renderUpload({ currentAvatar: "http://img/old.png" });
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("avatarDeletedFailed"));
  });

  it("hides the delete button when there is no avatar to remove", () => {
    renderUpload();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
