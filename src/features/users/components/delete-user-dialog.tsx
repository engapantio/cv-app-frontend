"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { DeleteUserDocument } from "@/gql/generated/graphql";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
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
              className="uppercase flex-1 py-1.5"
              style={{
                boxShadow:
                  "0 1px 5px 0 rgba(0,0,0,0.12),0 2px 2px 0 rgba(0,0,0,0.14),0 3px 1px -2px rgba(0,0,0,0.2)",
              }}
              onClick={handleConfirm}
              disabled={deleting}
            >
              {deleting ? t("buttons.deleting") : t("buttons.confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
