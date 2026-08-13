"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { DeleteLanguageDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { DialogActions } from "@/components/shared/dialog-actions";
import { removeById } from "@/lib/apollo/cache-utils";
import type { LanguageItem } from "@/features/languages/types";

interface DeleteLanguageDialogProps {
  target: LanguageItem | null;
  onClose: () => void;
  onDeleted: (languageId: string) => void;
}

export function DeleteLanguageDialog({ target, onClose, onDeleted }: DeleteLanguageDialogProps) {
  const t = useTranslations();
  const [deleteLanguage, { loading: deleting }] = useMutation(DeleteLanguageDocument, {
    update(cache, { data }) {
      if (!data?.deleteLanguage || !target) return;
      cache.modify({
        fields: {
          languages: removeById(target.id),
        },
      });
    },
  });

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await deleteLanguage({ variables: { language: { languageId: target.id } } });
      onDeleted(target.id);
      onClose();
    } catch {}
  }, [target, deleteLanguage, onDeleted, onClose]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-lg bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.deleteLanguage")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.deleteLanguageConfirm", { name: target?.name ?? "" })}
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
