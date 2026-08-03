"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { VerifyMailDocument } from "@/gql/generated/graphql";
import { markUserVerified, useSession } from "@/lib/auth/session";
import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { AuthFormRootError } from "@/components/auth/auth-form-root-error";
import { AuthFormSubmitButton } from "@/components/auth/auth-form-submit-button";
import { Input } from "@/components/ui/input";

const verifyEmailSchema = z.object({
  otp: z
    .string()
    .min(1, "Verification code is required")
    .regex(/^[0-9]+$/, "Verification code must contain only digits"),
});

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

const REDIRECT_DELAY_MS = 1500;

export function VerifyEmailForm() {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [verifyMail] = useMutation(VerifyMailDocument);
  const { user } = useSession();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
  });

  const continueIntoApp = () => {
    router.replace(`/users/${user?.id ?? ""}/profile`);
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
        message: "Invalid verification code. Please check the code and try again.",
      });
    }
  };

  if (verified) {
    return (
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="size-16 text-primary" />
        <h1 className="mt-6 text-[34px] font-normal leading-10.5 tracking-[0.25px] text-foreground">
          Email verified
        </h1>
        <p className="mt-4 text-base leading-6 tracking-[0.15px] text-foreground">
          Your account is now verified. Redirecting you to the app...
        </p>
        <Loader2 className="mt-8 size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthFormHeader
        title="Verify your email"
        subtitle="Enter the code we sent to your email to verify your account"
      />

      <div className="space-y-5">
        <div className="relative">
          <Input
            id="verify-email-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Verification code"
            disabled={isSubmitting}
            className="rounded-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
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
        <AuthFormSubmitButton loading={isSubmitting} loadingText="Verifying...">
          Verify email
        </AuthFormSubmitButton>

        <button
          type="button"
          onClick={continueIntoApp}
          className="flex items-center gap-1.5 text-sm tracking-[0.4px] uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          <CheckCircle2 className="size-4" />
          Skip for now
        </button>
      </div>
    </form>
  );
}
