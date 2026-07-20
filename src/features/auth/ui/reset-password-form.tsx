"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PasswordField } from "@/components/auth/password-field";
import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { AuthFormRootError } from "@/components/auth/auth-form-root-error";
import { AuthFormSubmitButton } from "@/components/auth/auth-form-submit-button";

const resetSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

type ResetPasswordFormProps = {
  token?: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: data.newPassword, token }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError("root", { message: payload.message ?? "Something went wrong." });
        return;
      }

      router.replace("/auth/login");
    } catch {
      setError("root", { message: "Unexpected error. Please try again." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthFormHeader
        title="Reset password"
        subtitle="Enter your new password below."
      />

      <div className="space-y-5">
        <div className="relative">
          <PasswordField
            id="reset-new-password"
            placeholder="New password"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="absolute left-0 top-full text-sm text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="relative">
          <PasswordField
            id="reset-confirm-password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="absolute left-0 top-full text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <AuthFormRootError message={errors.root?.message} />

      <div className="mt-14 flex flex-col items-center gap-2">
        <AuthFormSubmitButton loading={isSubmitting} loadingText="Resetting...">
          Reset password
        </AuthFormSubmitButton>

        <Link
          href="/auth/login"
          className="text-sm tracking-[0.4px] uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to login
        </Link>
      </div>
    </form>
  );
}
