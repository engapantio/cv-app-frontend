"use client";

import { Loader2 } from "lucide-react";
import { useAuthForm } from "@/lib/auth/auth-form-hooks";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const { email, setEmail, password, setPassword, submitting, error, handleSubmit } = useAuthForm({
    endpoint: "/api/auth/login",
  });

  return (
    <AuthFormShell
      title="Log in"
      description="Enter your credentials to continue to the CV workspace."
      footerText="Don't have an account?"
      footerLinkLabel="Create one"
      footerHref="/auth/signup"
    >
      <form className="space-y-5" onSubmit={(e) => handleSubmit(e)}>
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <PasswordField
            id="login-password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
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
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthFormShell>
  );
}
