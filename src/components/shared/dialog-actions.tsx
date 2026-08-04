"use client";

import { Button, DialogFooter } from "@/components/ui";
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
  submitClassName?: string;
}

const RED = "#e53935";

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
  submitClassName,
}: DialogActionsProps) {
  const t = useTranslations("buttons");
  const resolvedCancel = cancelLabel ?? t("cancel");

  return (
    <DialogFooter className={cn("gap-3 border-t-0 bg-transparent mx-0 mb-0 py-0", className)}>
      <Button
        type="button"
        variant="ghost"
        className="uppercase min-w-30 border border-border py-1.5"
        onClick={onCancel}
      >
        {resolvedCancel}
      </Button>
      <Button
        type={type}
        className={cn("uppercase text-white min-w-30 py-1.5", submitClassName)}
        style={{ backgroundColor: RED }}
        disabled={disabled || loading}
        onClick={onSubmit}
      >
        {loading ? (loadingLabel ?? submitLabel) : submitLabel}
      </Button>
    </DialogFooter>
  );
}
