"use client";

import { Button } from "@/components/ui";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface DialogActionsProps {
  cancelLabel?: string;
  submitLabel: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "submit" | "button";
  onSubmit?: () => void;
  onCancel: () => void;
  className?: string;
  actionsClassName?: string;
  submitClassName?: string;
}

export function DialogActions({
  cancelLabel,
  submitLabel,
  loadingLabel,
  loading = false,
  disabled = false,
  type = "button",
  onSubmit,
  onCancel,
  className,
  actionsClassName,
  submitClassName,
}: DialogActionsProps) {
  const t = useTranslations("buttons");
  const resolvedCancel = cancelLabel ?? t("cancel");

  return (
    <div className={cn("flex flex-row items-center justify-end gap-2", className)}>
      <div className={cn("flex w-2/3 gap-2", actionsClassName)}>
        <Button
          type="button"
          variant="ghost"
          className="uppercase flex-1 border border-border py-1.5 text-border"
          onClick={onCancel}
        >
          {resolvedCancel}
        </Button>
        <Button
          type={type}
          variant="danger"
          className={cn(
            "uppercase flex-1 py-1.5",
            !disabled && !loading && "shadow-solid",
            submitClassName,
          )}
          disabled={disabled || loading}
          onClick={onSubmit}
        >
          {loading ? (loadingLabel ?? submitLabel) : submitLabel}
        </Button>
      </div>
    </div>
  );
}
