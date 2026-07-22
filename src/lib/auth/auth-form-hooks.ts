"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthenticatedSession } from "@/lib/auth/session";
import { SessionUser } from "@/lib/auth/cookies";

type UseAuthFormOptions = {
  endpoint: string;
  onSuccess?: () => void;
};

export function useAuthForm({ endpoint, onSuccess }: UseAuthFormOptions) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>,
    additionalValidation?: () => string | null,
  ) {
    event.preventDefault();

    if (additionalValidation) {
      const validationError = additionalValidation();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const payload = await response.json();

      if (
        !response.ok ||
        !payload.user ||
        typeof payload.user !== "object" ||
        Array.isArray(payload.user)
      ) {
        setError(payload.message ?? "Unable to authenticate.");
        return;
      }

      setAuthenticatedSession(payload.user as SessionUser);

      router.replace("/users");
      router.refresh();

      onSuccess?.();
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    submitting,
    error,
    setError,
    handleSubmit,
  };
}

// ── Forgot Password ──────────────────────────────────────────────────────────

type UseForgotPasswordFormOptions = {
  onSuccess?: () => void;
};

export function useForgotPasswordForm({ onSuccess }: UseForgotPasswordFormOptions = {}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          setError(payload.message ?? "Unable to send reset email right now.");
        } else {
          setError(payload.message ?? "Unable to send reset link.");
        }
        return;
      }

      setSent(true);
      onSuccess?.();
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return { email, setEmail, submitting, error, sent, handleSubmit };
}

// ── Reset Password ────────────────────────────────────────────────────────────

type UseResetPasswordFormOptions = {
  token?: string;
  onSuccess?: () => void;
};

export function useResetPasswordForm({ token, onSuccess }: UseResetPasswordFormOptions = {}) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("All fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, token }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message ?? "Something went wrong.");
        return;
      }

      onSuccess?.();
      router.replace("/auth/login");
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    submitting,
    error,
    handleSubmit,
  };
}
