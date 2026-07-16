"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthenticatedSession, SessionUser } from "@/lib/auth/session";

type AuthUser = {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role: "Admin" | "Employee";
};

function normalizeFullName(user: AuthUser): string {
  if (user.fullName?.trim()) return user.fullName.trim();
  const combined = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return combined || user.email;
}

function mapToSessionUser(user: AuthUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    fullName: normalizeFullName(user),
    role: user.role,
  };
}

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

      if (!response.ok || !payload.user) {
        setError(payload.message ?? "Unable to authenticate.");
        return;
      }

      setAuthenticatedSession(mapToSessionUser(payload.user));

      router.replace("/users");
      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
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
