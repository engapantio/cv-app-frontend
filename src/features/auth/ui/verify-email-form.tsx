"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { VerifyMailDocument } from "@/gql/generated/graphql";
import { markUserVerified, useSession } from "@/lib/auth/session";
import { AuthField } from "@/components/auth/auth-field";
import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { AuthFormRootError } from "@/components/auth/auth-form-root-error";
import { AuthFormSubmitButton } from "@/components/auth/auth-form-submit-button";

const verifyEmailSchema = (t: ReturnType<typeof useTranslations<"auth">>) =>
  z.object({
    otp: z
      .string()
      .min(1, t("validation.otpRequired"))
      .regex(/^[0-9]+$/, t("validation.otpDigits")),
  });

type VerifyEmailFormData = z.infer<ReturnType<typeof verifyEmailSchema>>;

const REDIRECT_DELAY_MS = 1500;

export function VerifyEmailForm({ userId }: { userId?: string }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const [verified, setVerified] = useState(false);
  const [verifyMail] = useMutation(VerifyMailDocument);
  const { user } = useSession();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema(t)),
  });

  const continueIntoApp = () => {
    const id = user?.id ?? userId;
    router.replace(id ? `/users/${id}/profile` : "/users");
    router.refresh();
  };

  const onSubmit = async (data: VerifyEmailFormData) => {
    try {
      await verifyMail({ variables: { mail: { otp: data.otp } } });
      markUserVerified();
      setVerified(true);
      setTimeout(continueIntoApp, REDIRECT_DELAY_MS);
    } catch {
      setError("root", {
        message: t("verify.failed"),
      });
    }
  };

  if (verified) {
    return (
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="size-16 text-primary" />
        <h1 className="mt-6 text-[34px] font-normal leading-10.5 tracking-[0.25px] text-foreground">
          {t("verify.verifiedTitle")}
        </h1>
        <p className="mt-4 text-base leading-6 tracking-[0.15px] text-foreground">
          {t("verify.verifiedText")}
        </p>
        <Loader2 className="mt-8 size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthFormHeader title={t("verify.title")} subtitle={t("verify.subtitle")} />

      <div className="space-y-5">
        <div className="relative">
          <AuthField
            id="verify-email-otp"
            label={t("verify.otpLabel")}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            disabled={isSubmitting}
            {...register("otp")}
          />
          {errors.otp && (
            <p className="absolute left-0 top-full text-sm text-destructive">
              {errors.otp.message}
            </p>
          )}
        </div>
      </div>

      <AuthFormRootError message={errors.root?.message} />

      <div className="mt-14 flex flex-col items-center gap-2">
        <AuthFormSubmitButton loading={isSubmitting} loadingText={t("verify.submitLoading")}>
          {t("verify.submit")}
        </AuthFormSubmitButton>

        <button
          type="button"
          onClick={continueIntoApp}
          className="flex items-center gap-1.5 text-sm tracking-[0.4px] uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          <CheckCircle2 className="size-4" />
          {t("verify.skip")}
        </button>
      </div>
    </form>
  );
}
