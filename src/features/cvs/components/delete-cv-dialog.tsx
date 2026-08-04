"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { DeleteCvDocument, type UserQuery } from "@/gql/generated/graphql";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";

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
      <DialogContent showCloseButton className="sm:max-w-lg bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.deleteCv")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.deleteCvConfirm", { name: target?.name ?? "" })}
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
