"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { AuthFormRootError } from "@/components/auth/auth-form-root-error";
import { AuthFormSubmitButton } from "@/components/auth/auth-form-submit-button";
import { Input } from "@/components/ui/input";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.trim() }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          setError("root", { message: payload.message ?? "Unable to send reset email right now." });
        } else {
          setError("root", { message: payload.message ?? "Unable to send reset link." });
        }
        return;
      }

      setSent(true);
    } catch {
      setError("root", { message: "Unexpected error. Please try again." });
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto size-12 text-foreground/60" />
        <h2 className="mt-4 text-[34px] font-normal leading-10.5 tracking-[0.25px] text-foreground">
          Check your inbox
        </h2>
        <p className="mt-2.5 text-base leading-6 tracking-[0.15px] text-foreground">
          If an account exists for that email, we sent a password reset link.
        </p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          The reset link should arrive shortly. If you do not see it, check your spam folder.
        </p>
        <Link
          href="/auth/login"
          className="mt-8 inline-block text-sm tracking-[0.4px] uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          CANCEL
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthFormHeader
        title="Forgot password"
        subtitle="We will send you an email with further instructions."
      />

      <div className="relative">
        <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
          <span className="absolute -top-2.5 left-3 bg-background px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)] transition-colors group-focus-within:text-primary">
            Email
          </span>
          <Input
            id="forgot-email"
            type="email"
            placeholder=""
            autoComplete="email"
            disabled={isSubmitting}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="absolute left-0 top-full text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <AuthFormRootError message={errors.root?.message} />

      <div className="mt-14 flex flex-col items-center gap-2">
        <AuthFormSubmitButton loading={isSubmitting} loadingText="Sending...">
          RESET LINK
        </AuthFormSubmitButton>

        <Link
          href="/auth/login"
          className="text-sm tracking-[0.4px] uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          CANCEL
        </Link>
      </div>
    </form>
  );
}
