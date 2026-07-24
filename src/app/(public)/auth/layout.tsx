import { AuthTabsSwitcher } from "@/components/auth/auth-tabs-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pt-2">
        <AuthTabsSwitcher />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-140">{children}</div>
      </div>
    </>
  );
}
