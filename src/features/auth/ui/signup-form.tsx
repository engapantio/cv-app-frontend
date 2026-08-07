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

const signupSchema = (t: ReturnType<typeof useTranslations<"auth">>) =>
  z.object({
    email: z.string().min(1, t("validation.emailRequired")).email(t("validation.emailInvalid")),
    password: z.string().min(8, t("validation.passwordMin")),
  });

type SignupFormData = z.infer<ReturnType<typeof signupSchema>>;

export function SignupForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [redirecting, setRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema(t)),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await fetch("/api/auth/signup", {
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
          message: payload.message ?? t("signup.failed"),
        });
        return;
      }

      if (payload.accessToken) {
        setTokens(payload.accessToken, payload.refreshToken ?? null);
      }
      setAuthenticatedSession(payload.user);
      reset();
      setRedirecting(true);
      router.replace("/verify-email");
      router.refresh();
    } catch {
      setError("root", { message: t("common.unexpectedError") });
    }
  };

  return (
    <>
      {redirecting && <GlobalLoader />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AuthFormHeader title={t("signup.title")} subtitle={t("signup.subtitle")} />

        <div className="space-y-5">
          <div className="relative">
            <AuthField
              id="signup-email"
              label={t("signup.emailLabel")}
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
              id="signup-password"
              label={t("signup.passwordLabel")}
              type="password"
              autoComplete="new-password"
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
          <AuthFormSubmitButton loading={isSubmitting} loadingText={t("signup.submitLoading")}>
            {t("signup.submit")}
          </AuthFormSubmitButton>

          <Link
            href="/auth/login"
            className="text-sm tracking-[0.4px] uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("signup.hasAccount")}
          </Link>
        </div>
      </form>
    </>
  );
}
