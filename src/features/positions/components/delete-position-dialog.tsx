"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { DeletePositionDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { DialogActions } from "@/components/shared/dialog-actions";
import { removeById } from "@/lib/apollo/cache-utils";
import type { PositionItem } from "@/features/positions/types";

interface DeletePositionDialogProps {
  target: PositionItem | null;
  onClose: () => void;
  onDeleted: (positionId: string) => void;
}

export function DeletePositionDialog({ target, onClose, onDeleted }: DeletePositionDialogProps) {
  const t = useTranslations();
  const [deletePosition, { loading: deleting }] = useMutation(DeletePositionDocument, {
    update(cache, { data }) {
      if (!data?.deletePosition || !target) return;
      cache.modify({
        fields: {
          positions: removeById(target.id),
        },
      });
    },
  });

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await deletePosition({ variables: { position: { positionId: target.id } } });
      onDeleted(target.id);
      onClose();
    } catch {}
  }, [target, deletePosition, onDeleted, onClose]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-3xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.deletePosition")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.deletePositionConfirm", { name: target?.name ?? "" })}
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
