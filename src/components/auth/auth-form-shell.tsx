import Link from "next/link";
import { ReactNode } from "react";

type AuthFormShellProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  footerText?: string;
  footerLinkLabel?: string;
  footerHref?: string;
  footer?: ReactNode;
};

export function AuthFormShell({
  title,
  description,
  children,
  footerText,
  footerLinkLabel,
  footerHref,
  footer,
}: AuthFormShellProps) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-sm backdrop-blur sm:p-8">
      {(title || description) && (
        <div className="mb-8 space-y-2 text-center">
          {title ? (
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          ) : null}
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      )}

      {children}

      {footer ??
        (footerText && footerLinkLabel && footerHref ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <Link
              href={footerHref}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {footerLinkLabel}
            </Link>
          </p>
        ) : null)}
    </section>
  );
}
