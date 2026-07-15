"use client";

import { SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setAuthenticatedSession } from "@/lib/auth/session";
import { AuthFormShell } from "@/components/auth/auth-form -shell";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignupResponse = {
  user?: {
    id: string;
    email: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    role: "Admin" | "Employee";
  };
  message?: string;
};

function normalizeFullName(user: NonNullable<SignupResponse["user"]>) {
  if (user.fullName?.trim()) return user.fullName.trim();
  const combined = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return combined || user.email;
}

function validateSignup(email: string, password: string, confirmPassword: string) {
  if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
    return "All fields are required.";
  }

  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateSignup(email, password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
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

      const payload = (await response.json()) as SignupResponse;

      if (!response.ok || !payload.user) {
        setError(payload.message ?? "Unable to create account.");
        return;
      }

      setAuthenticatedSession({
        id: payload.user.id,
        email: payload.user.email,
        fullName: normalizeFullName(payload.user),
        role: payload.user.role,
      });

      router.replace("/users");
      router.refresh();
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      title="Sign up"
      description="Create an account to start managing CVs, skills, languages, and projects."
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerHref="/auth/login"
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <PasswordField
            id="signup-password"
            placeholder="Create a password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-confirm-password">Confirm password</Label>
          <PasswordField
            id="signup-confirm-password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={submitting}
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Sign up"
          )}
        </Button>
      </form>
    </AuthFormShell>
  );
}
