"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
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
      <DialogContent showCloseButton className="sm:max-w-sm bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.removeProject")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.removeProjectConfirm", { name: target?.name ?? "" })}
        </p>
        <div
          className="flex flex-row justify-end items-center gap-3 mt-2 py-3"
          style={{ paddingRight: "48px" }}
        >
          <Button
            variant="ghost"
            className="uppercase min-w-30 border border-border py-1.5"
            onClick={onClose}
          >
            {t("buttons.cancel")}
          </Button>
          <Button
            type="submit"
            className="uppercase text-white min-w-30 py-1.5 hover:brightness-90"
            style={{
              backgroundColor: "#e53935",
              boxShadow:
                "0 1px 5px 0 rgba(0,0,0,0.12),0 2px 2px 0 rgba(0,0,0,0.14),0 3px 1px -2px rgba(0,0,0,0.2)",
            }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? t("buttons.removing") : t("buttons.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
