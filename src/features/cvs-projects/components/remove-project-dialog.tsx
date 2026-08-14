"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { DialogActions } from "@/components/shared/dialog-actions";
import type { CvProjectItem } from "../hooks/use-cv-projects-page";

interface RemoveProjectDialogProps {
  target: CvProjectItem | null;
  onClose: () => void;
  onConfirm: (projectId: string) => Promise<void>;
  loading: boolean;
}

export function RemoveProjectDialog({
  target,
  onClose,
  onConfirm,
  loading,
}: RemoveProjectDialogProps) {
  const t = useTranslations();
  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await onConfirm(target.project.id);
      onClose();
    } catch {
      toast.error(t("common.removeProjectFailed"));
    }
  }, [target, onConfirm, onClose, t]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.removeProject")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.removeProjectConfirm", { name: target?.name ?? "" })}
        </p>
        <DialogActions
          submitLabel={t("buttons.confirm")}
          loadingLabel={t("buttons.removing")}
          loading={loading}
          disabled={loading}
          onCancel={onClose}
          onSubmit={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
