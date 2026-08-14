"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { DialogActions } from "@/components/shared/dialog-actions";
import type { ProjectItem } from "../hooks/use-projects-page";

interface DeleteProjectDialogProps {
  target: ProjectItem | null;
  onClose: () => void;
  onConfirm: (projectId: string) => Promise<void>;
  loading: boolean;
}

export function DeleteProjectDialog({
  target,
  onClose,
  onConfirm,
  loading,
}: DeleteProjectDialogProps) {
  const t = useTranslations();
  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await onConfirm(target.id);
      onClose();
    } catch {
      toast.error(t("common.deleteProjectFailed"));
    }
  }, [target, onConfirm, onClose, t]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-3xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.deleteProject")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.deleteProjectConfirm", { name: target?.name ?? "" })}
        </p>
        <DialogActions
          submitLabel={t("buttons.confirm")}
          loadingLabel={t("buttons.deleting")}
          loading={loading}
          disabled={loading}
          onCancel={onClose}
          onSubmit={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
