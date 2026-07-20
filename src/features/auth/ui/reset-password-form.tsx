"use client";

import { Loader2 } from "lucide-react";
import { useResetPasswordForm } from "@/lib/auth/auth-form-hooks";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ResetPasswordFormProps = {
  token?: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    submitting,
    error,
    handleSubmit,
  } = useResetPasswordForm({ token });

  return (
    <AuthFormShell
      title="Reset password"
      description="Enter your new password below."
      footerText="Remembered your password?"
      footerLinkLabel="Log in"
      footerHref="/auth/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="reset-new-password">New password</Label>
          <PasswordField
            id="reset-new-password"
            placeholder="Enter new password"
            autoComplete="new-password"
            value={newPassword}
            onChange={setNewPassword}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reset-confirm-password">Confirm new password</Label>
          <PasswordField
            id="reset-confirm-password"
            placeholder="Repeat new password"
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
              Resetting...
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </AuthFormShell>
  );
}
