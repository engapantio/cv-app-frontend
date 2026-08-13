import { act, renderHook, waitFor } from "@testing-library/react";
import { useAuthForm, useForgotPasswordForm, useResetPasswordForm } from "./auth-form-hooks";
import { setAuthenticatedSession } from "./session";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
}));
jest.mock("./session", () => ({ setAuthenticatedSession: jest.fn() }));

const mockSetAuthenticatedSession = setAuthenticatedSession as unknown as jest.Mock;

function formEvent() {
  return {
    preventDefault: jest.fn(),
    submitter: null,
  } as unknown as React.SubmitEvent<HTMLFormElement>;
}

async function flush() {
  await act(async () => {});
}

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe("useAuthForm", () => {
  it("validates that email and password are provided", async () => {
    const { result } = renderHook(() => useAuthForm({ endpoint: "/api/auth/login" }));
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.error).toBe("Email and password are required.");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("runs additional validation before submitting", async () => {
    const { result } = renderHook(() => useAuthForm({ endpoint: "/api/auth/login" }));
    await act(async () => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("secret");
    });
    await flush();
    await act(async () => {
      await result.current.handleSubmit(formEvent(), () => "custom error");
    });
    expect(result.current.error).toBe("custom error");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("reports the server message on a non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Bad credentials" }),
    });
    const { result } = renderHook(() => useAuthForm({ endpoint: "/api/auth/login" }));
    await act(async () => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("secret");
    });
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.error).toBe("Bad credentials");
    expect(result.current.submitting).toBe(false);
  });

  it("rejects a response without a valid user payload", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    const { result } = renderHook(() => useAuthForm({ endpoint: "/api/auth/login" }));
    await act(async () => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("secret");
    });
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.error).toBe("Unable to authenticate.");
    expect(mockSetAuthenticatedSession).not.toHaveBeenCalled();
  });

  it("sets the session and navigates on success", async () => {
    const user = { id: "u1", email: "a@b.com", role: "User" };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ user }),
    });
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useAuthForm({ endpoint: "/api/auth/login", onSuccess }));
    await act(async () => {
      result.current.setEmail(" a@b.com ");
      result.current.setPassword("secret");
    });
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(mockSetAuthenticatedSession).toHaveBeenCalledWith(user);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "a@b.com", password: "secret" }),
      }),
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(result.current.error).toBeNull();
  });

  it("sets a generic error when the request throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useAuthForm({ endpoint: "/api/auth/login" }));
    await act(async () => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("secret");
    });
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.error).toBe("Unexpected error. Please try again.");
  });
});

describe("useForgotPasswordForm", () => {
  it("validates that email is provided", async () => {
    const { result } = renderHook(() => useForgotPasswordForm());
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.error).toBe("Email is required.");
    expect(result.current.sent).toBe(false);
  });

  it("sets sent on a successful response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "ok" }),
    });
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useForgotPasswordForm({ onSuccess }));
    await act(async () => {
      result.current.setEmail("a@b.com");
    });
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.sent).toBe(true);
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it("reports a 503 message distinctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ message: "Service unavailable" }),
    });
    const { result } = renderHook(() => useForgotPasswordForm());
    await act(async () => {
      result.current.setEmail("a@b.com");
    });
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.error).toBe("Service unavailable");
  });

  it("handles request failures", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useForgotPasswordForm());
    await act(async () => {
      result.current.setEmail("a@b.com");
    });
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.error).toBe("Unexpected error. Please try again.");
  });
});

describe("useResetPasswordForm", () => {
  it("validates the new password fields", async () => {
    const { result } = renderHook(() => useResetPasswordForm({ token: "t" }));
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.error).toBe("All fields are required.");
  });

  it("rejects passwords shorter than 8 characters", async () => {
    const { result } = renderHook(() => useResetPasswordForm({ token: "t" }));
    await act(async () => {
      result.current.setNewPassword("short");
      result.current.setConfirmPassword("short");
    });
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.error).toBe("Password must be at least 8 characters.");
  });

  it("rejects mismatched passwords", async () => {
    const { result } = renderHook(() => useResetPasswordForm({ token: "t" }));
    await act(async () => {
      result.current.setNewPassword("long-enough");
      result.current.setConfirmPassword("different");
    });
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.error).toBe("Passwords do not match.");
  });

  it("navigates to login on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "ok" }),
    });
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useResetPasswordForm({ token: "t", onSuccess }));
    await act(async () => {
      result.current.setNewPassword("long-enough");
      result.current.setConfirmPassword("long-enough");
    });
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(result.current.error).toBeNull();
  });

  it("reports the server message on failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Token expired" }),
    });
    const { result } = renderHook(() => useResetPasswordForm({ token: "t" }));
    await act(async () => {
      result.current.setNewPassword("long-enough");
      result.current.setConfirmPassword("long-enough");
    });
    await act(async () => {
      await result.current.handleSubmit(formEvent());
    });
    expect(result.current.error).toBe("Token expired");
  });
});
