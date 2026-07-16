"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuthForm } from "@/lib/auth/auth-form-hooks";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function validateSignup(email: string, password: string, confirmPassword: string): string | null {
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
  const { email, setEmail, password, setPassword, submitting, error, handleSubmit } = useAuthForm({
    endpoint: "/api/auth/signup",
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <AuthFormShell
      title="Sign up"
      description="Create an account to start managing CVs, skills, languages, and projects."
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerHref="/auth/login"
    >
      <form
        className="space-y-5"
        onSubmit={(e) => handleSubmit(e, () => validateSignup(email, password, confirmPassword))}
      >
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
