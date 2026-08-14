"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { DeleteDepartmentDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { DialogActions } from "@/components/shared/dialog-actions";
import { removeById } from "@/lib/apollo/cache-utils";
import type { DepartmentItem } from "@/features/departments/types";

interface DeleteDepartmentDialogProps {
  target: DepartmentItem | null;
  onClose: () => void;
  onDeleted: (departmentId: string) => void;
}

export function DeleteDepartmentDialog({
  target,
  onClose,
  onDeleted,
}: DeleteDepartmentDialogProps) {
  const t = useTranslations();
  const [deleteDepartment, { loading: deleting }] = useMutation(DeleteDepartmentDocument, {
    update(cache, { data }) {
      if (!data?.deleteDepartment || !target) return;
      cache.modify({
        fields: {
          departments: removeById(target.id),
        },
      });
    },
  });

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await deleteDepartment({ variables: { department: { departmentId: target.id } } });
      onDeleted(target.id);
      onClose();
    } catch {}
  }, [target, deleteDepartment, onDeleted, onClose]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-3xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-semibold">
            {t("dialogs.deleteDepartment")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.deleteDepartmentConfirm", { name: target?.name ?? "" })}
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
