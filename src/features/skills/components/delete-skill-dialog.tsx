"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { DeleteSkillDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { DialogActions } from "@/components/shared/dialog-actions";
import { removeById } from "@/lib/apollo/cache-utils";
import type { SkillItem } from "@/features/skills/types";

interface DeleteSkillDialogProps {
  target: SkillItem | null;
  onClose: () => void;
  onDeleted: (skillId: string) => void;
}

export function DeleteSkillDialog({ target, onClose, onDeleted }: DeleteSkillDialogProps) {
  const t = useTranslations();
  const [deleteSkill, { loading: deleting }] = useMutation(DeleteSkillDocument, {
    update(cache, { data }) {
      if (!data?.deleteSkill || !target) return;
      cache.modify({
        fields: {
          skills: removeById(target.id),
        },
      });
    },
  });

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await deleteSkill({ variables: { skill: { skillId: target.id } } });
      onDeleted(target.id);
      onClose();
    } catch {}
  }, [target, deleteSkill, onDeleted, onClose]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-3xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-semibold">
            {t("dialogs.deleteSkill")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.deleteSkillConfirm", { name: target?.name ?? "" })}
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
