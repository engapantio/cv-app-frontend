"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { DeleteCvDocument, type UserQuery } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { DialogActions } from "@/components/shared/dialog-actions";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export function DeleteCvDialog({
  target,
  onClose,
  onDeleted,
}: {
  target: CvItem | null;
  onClose: () => void;
  onDeleted: (cvId: string) => void;
}) {
  const t = useTranslations();
  const [deleteCv, { loading: deleting }] = useMutation(DeleteCvDocument);

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await deleteCv({ variables: { cv: { cvId: target.id } } });
      onDeleted(target.id);
      onClose();
    } catch {}
  }, [target, deleteCv, onDeleted, onClose]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-3xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.deleteCv")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.deleteCvConfirm", { name: target?.name ?? "" })}
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
