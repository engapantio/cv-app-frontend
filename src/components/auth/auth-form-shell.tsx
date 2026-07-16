import Link from "next/link";
import { ReactNode } from "react";

type AuthFormShellProps = {
  title: string;
  description: string;
  footerText: string;
  footerLinkLabel: string;
  footerHref: string;
  children: ReactNode;
};

export function AuthFormShell({
  title,
  description,
  footerText,
  footerLinkLabel,
  footerHref,
  children,
}: AuthFormShellProps) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-sm backdrop-blur sm:p-8">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {children}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {footerText}{" "}
        <Link
          href={footerHref}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {footerLinkLabel}
        </Link>
      </p>
    </section>
  );
}

