"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { DeleteUserDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { DialogActions } from "@/components/shared/dialog-actions";
import type { UserItem } from "@/features/users/types";
import { useTranslations } from "next-intl";

interface DeleteUserDialogProps {
  target: UserItem | null;
  onClose: () => void;
  onDeleted: (userId: string) => void;
}

export function DeleteUserDialog({ target, onClose, onDeleted }: DeleteUserDialogProps) {
  const t = useTranslations();
  const [deleteUser, { loading: deleting }] = useMutation(DeleteUserDocument);

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await deleteUser({ variables: { userId: target.id } });
      onClose();
      await onDeleted(target.id);
    } catch {}
  }, [target, deleteUser, onDeleted, onClose]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-lg bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.deleteUser")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.deleteUserConfirm", {
            name: target?.profile?.full_name || target?.email || "",
          })}
        </p>
        <DialogActions
          submitLabel={t("buttons.confirm")}
          loadingLabel={t("buttons.deleting")}
          loading={deleting}
          disabled={deleting}
          onCancel={onClose}
          onSubmit={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
