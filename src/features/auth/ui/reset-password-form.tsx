"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { toast } from "sonner";
import { AuthField } from "@/components/auth/auth-field";
import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { AuthFormRootError } from "@/components/auth/auth-form-root-error";
import { AuthFormSubmitButton } from "@/components/auth/auth-form-submit-button";
import { GlobalLoader } from "@/components/auth/global-loader";

const resetSchema = (t: ReturnType<typeof useTranslations<"auth">>) =>
  z
    .object({
      newPassword: z.string().min(8, t("validation.passwordMin")),
      confirmPassword: z.string().min(1, t("validation.confirmRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

type ResetFormData = z.infer<ReturnType<typeof resetSchema>>;

type ResetPasswordFormProps = {
  token?: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const t = useTranslations("auth");
  const [redirecting, setRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema(t)),
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
        setError("root", { message: payload.message ?? t("reset.failed") });
        return;
      }

      toast.success(t("reset.success"));
      setRedirecting(true);
      router.replace("/auth/login");
    } catch {
      setError("root", { message: t("common.unexpectedError") });
    }
  };

  return (
    <>
      {redirecting && <GlobalLoader />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AuthFormHeader title={t("reset.title")} subtitle={t("reset.subtitle")} />

        <div className="space-y-7">
          <div className="relative">
            <AuthField
              id="reset-new-password"
              label={t("reset.newPasswordLabel")}
              type="password"
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
            <AuthField
              id="reset-confirm-password"
              label={t("reset.confirmLabel")}
              type="password"
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
          <AuthFormSubmitButton loading={isSubmitting} loadingText={t("reset.submitLoading")}>
            {t("reset.submit")}
          </AuthFormSubmitButton>

          <Link
            href="/auth/login"
            className="text-sm tracking-[0.4px] uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("reset.backToLogin")}
          </Link>
        </div>
      </form>
    </>
  );
}
