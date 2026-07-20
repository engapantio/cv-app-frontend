import { AuthTabsSwitcher } from "@/components/auth/auth-tabs-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-sm backdrop-blur sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your account or create a new one
        </p>
      </div>

      <AuthTabsSwitcher />

      <div className="mt-6">{children}</div>
    </section>
  );
}
