"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setAuthenticatedSession } from "@/lib/auth/session";
import { PasswordField } from "@/components/auth/password-field";
import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { AuthFormRootError } from "@/components/auth/auth-form-root-error";
import { AuthFormSubmitButton } from "@/components/auth/auth-form-submit-button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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
        setError("root", { message: payload.message ?? "Unable to authenticate." });
        return;
      }

      setAuthenticatedSession(payload.user);
      router.replace("/users");
      router.refresh();
    } catch {
      setError("root", { message: "Unexpected error. Please try again." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthFormHeader
        title="Welcome back"
        subtitle="Nice to see you! Log in to continue"
      />

      <div className="space-y-5">
        <div className="relative">
          <Input
            id="login-email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            disabled={isSubmitting}
            className="rounded-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
            {...register("email")}
          />
          {errors.email && (
            <p className="absolute left-0 top-full text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="relative">
          <PasswordField
            id="login-password"
            placeholder="Password"
            autoComplete="current-password"
            disabled={isSubmitting}
            className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
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
        <AuthFormSubmitButton loading={isSubmitting} loadingText="Logging in...">
          Log in
        </AuthFormSubmitButton>

        <Link
          href="/auth/forgot-password"
          className="text-sm tracking-[0.4px] uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
