"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UpdatePositionDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@/components/ui";
import { DialogActions, FloatingField } from "@/components/shared";
import type { PositionItem } from "@/features/positions/types";

type UpdatePositionFormData = {
  name: string;
};

interface UpdatePositionDialogProps {
  target: PositionItem | null;
  onClose: () => void;
  onUpdated: (result: { id: string; created_at: string; name: string }) => void;
}

export function UpdatePositionDialog({ target, onClose, onUpdated }: UpdatePositionDialogProps) {
  const t = useTranslations();
  const [updatePosition, { loading: updating }] = useMutation(UpdatePositionDocument);

  const validation = useMemo(() => ({ requiredName: t("validation.nameRequired") }), [t]);

  const updatePositionSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, validation.requiredName),
      }),
    [validation],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdatePositionFormData>({
    resolver: zodResolver(updatePositionSchema),
    defaultValues: {
      name: target?.name ?? "",
    },
  });

  const onSubmit = useCallback(
    async (formData: UpdatePositionFormData) => {
      if (!target) return;
      try {
        const { data } = await updatePosition({
          variables: {
            position: {
              positionId: target.id,
              name: formData.name.trim(),
            },
          },
        });
        if (data?.updatePosition) {
          onUpdated(data.updatePosition);
        }
        onClose();
      } catch {
        toast.error(t("common.updatePositionFailed"));
        onClose();
      }
    },
    [target, updatePosition, onUpdated, onClose, t],
  );

  const inputClasses =
    "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-2xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-semibold">
            {t("dialogs.updatePosition")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
          <FloatingField label={t("fields.name")} error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder=" "
              disabled={isSubmitting || updating}
              className={inputClasses}
            />
          </FloatingField>
          <DialogActions
            type="submit"
            submitLabel={t("buttons.update")}
            loadingLabel={t("buttons.updating")}
            loading={updating}
            disabled={!isDirty || isSubmitting}
            onCancel={onClose}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
