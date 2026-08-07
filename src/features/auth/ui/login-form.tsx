"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { setAuthenticatedSession } from "@/lib/auth/session";
import { setTokens } from "@/lib/auth/token-store";
import { AuthField } from "@/components/auth/auth-field";
import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { AuthFormRootError } from "@/components/auth/auth-form-root-error";
import { AuthFormSubmitButton } from "@/components/auth/auth-form-submit-button";
import { GlobalLoader } from "@/components/auth/global-loader";

const loginSchema = (t: ReturnType<typeof useTranslations<"auth">>) =>
  z.object({
    email: z.string().min(1, t("validation.emailRequired")).email(t("validation.emailInvalid")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });

type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [redirecting, setRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema(t)),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const payload = await response.json();

      if (
        !response.ok ||
        !payload.user ||
        typeof payload.user !== "object" ||
        Array.isArray(payload.user)
      ) {
        setError("root", {
          message: payload.message ?? t("login.failed"),
        });
        return;
      }

      if (payload.accessToken) {
        setTokens(payload.accessToken, payload.refreshToken ?? null);
      }
      setAuthenticatedSession(payload.user);
      reset();
      setRedirecting(true);
      const profileUrl = `/users/${payload.user.id}/profile`;
      router.replace(profileUrl);
      router.refresh();
    } catch {
      setError("root", { message: t("common.unexpectedError") });
    }
  };

  return (
    <>
      {redirecting && <GlobalLoader />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AuthFormHeader title={t("login.title")} subtitle={t("login.subtitle")} />

        <div className="space-y-5">
          <div className="relative">
            <AuthField
              id="login-email"
              label={t("login.emailLabel")}
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

          <div className="relative">
            <AuthField
              id="login-password"
              label={t("login.passwordLabel")}
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              {...register("password")}
            />
            {errors.password && (
              <p className="absolute left-0 top-full text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <AuthFormRootError message={errors.root?.message} />

        <div className="mt-14 flex flex-col items-center gap-2">
          <AuthFormSubmitButton loading={isSubmitting} loadingText={t("login.submitLoading")}>
            {t("login.submit")}
          </AuthFormSubmitButton>

          <Link
            href="/auth/forgot-password"
            className="text-sm tracking-[0.4px] uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>
      </form>
    </>
  );
}
