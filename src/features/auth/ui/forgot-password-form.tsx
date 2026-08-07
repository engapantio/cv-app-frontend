"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { AuthField } from "@/components/auth/auth-field";
import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { AuthFormRootError } from "@/components/auth/auth-form-root-error";
import { AuthFormSubmitButton } from "@/components/auth/auth-form-submit-button";

const forgotSchema = (t: ReturnType<typeof useTranslations<"auth">>) =>
  z.object({
    email: z.string().min(1, t("validation.emailRequired")).email(t("validation.emailInvalid")),
  });

type ForgotFormData = z.infer<ReturnType<typeof forgotSchema>>;

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema(t)),
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
          setError("root", { message: payload.message ?? t("forgot.unavailable") });
        } else {
          setError("root", { message: payload.message ?? t("forgot.failed") });
        }
        return;
      }

      setSent(true);
    } catch {
      setError("root", { message: t("common.unexpectedError") });
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto size-12 text-foreground/60" />
        <h2 className="mt-4 text-[34px] font-normal leading-10.5 tracking-[0.25px] text-foreground">
          {t("forgot.sentTitle")}
        </h2>
        <p className="mt-2.5 text-base leading-6 tracking-[0.15px] text-foreground">
          {t("forgot.sentText")}
        </p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("forgot.sentSpam")}</p>
        <Link
          href="/auth/login"
          className="mt-8 inline-block text-sm tracking-[0.4px] uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("forgot.cancel")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthFormHeader title={t("forgot.title")} subtitle={t("forgot.subtitle")} />

      <div className="relative">
        <AuthField
          id="forgot-email"
          label={t("forgot.emailLabel")}
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email && (
          <p className="absolute left-0 top-full text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <AuthFormRootError message={errors.root?.message} />

      <div className="mt-14 flex flex-col items-center gap-2">
        <AuthFormSubmitButton loading={isSubmitting} loadingText={t("forgot.submitLoading")}>
          {t("forgot.submit")}
        </AuthFormSubmitButton>

        <Link
          href="/auth/login"
          className="text-sm tracking-[0.4px] uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("forgot.cancel")}
        </Link>
      </div>
    </form>
  );
}
