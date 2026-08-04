"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
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
      <DialogContent showCloseButton className="sm:max-w-lg bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.deleteProject")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.deleteProjectConfirm", { name: target?.name ?? "" })}
        </p>
        <div
          className="flex flex-row items-center justify-end gap-3 mt-2 py-3"
          style={{ paddingRight: "48px" }}
        >
          <div className="flex w-2/3 gap-3">
            <Button
              variant="ghost"
              className="uppercase flex-1 border border-border py-1.5"
              onClick={onClose}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              type="submit"
              className="uppercase flex-1 py-1.5 hover:brightness-90"
              style={{
                backgroundColor: "#e53935",
                boxShadow:
                  "0 1px 5px 0 rgba(0,0,0,0.12),0 2px 2px 0 rgba(0,0,0,0.14),0 3px 1px -2px rgba(0,0,0,0.2)",
              }}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? t("buttons.deleting") : t("buttons.confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
