"use client";

import { Loader2, MailCheck } from "lucide-react";
import { useForgotPasswordForm } from "@/lib/auth/auth-form-hooks";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const { email, setEmail, submitting, error, sent, handleSubmit } = useForgotPasswordForm();

  if (sent) {
    return (
      <AuthFormShell
        title="Check your inbox"
        description="If an account exists for that email, we sent a password reset link."
      >
        <div className="space-y-4 text-center">
          <MailCheck className="mx-auto size-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            The reset link should arrive shortly. If you do not see it, check your spam folder.
          </p>
        </div>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title="Forgot password"
      description="Enter your email address and we'll send you a reset link."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>
    </AuthFormShell>
  );
}
