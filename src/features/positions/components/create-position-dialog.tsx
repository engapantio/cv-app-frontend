"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CreatePositionDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@/components/ui";
import { DialogActions, FloatingField } from "@/components/shared";

type CreatePositionFormData = {
  name: string;
};

interface CreatePositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: { id: string; created_at: string; name: string }) => void;
}

export function CreatePositionDialog({ open, onOpenChange, onCreated }: CreatePositionDialogProps) {
  const t = useTranslations();
  const [createPosition, { loading: creating }] = useMutation(CreatePositionDocument, {
    update(cache, { data }) {
      if (!data?.createPosition) return;
      cache.modify({
        fields: {
          positions(existingRefs = []) {
            const newRef = cache.writeFragment({
              data: data.createPosition,
              fragment: gql`
                fragment NewPosition on Position {
                  id
                  created_at
                  name
                }
              `,
            });
            return [newRef, ...existingRefs];
          },
        },
      });
    },
  });

  const validation = useMemo(() => ({ requiredName: t("validation.nameRequired") }), [t]);

  const createPositionSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, validation.requiredName),
      }),
    [validation],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreatePositionFormData>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = useCallback(
    async (formData: CreatePositionFormData) => {
      try {
        const { data } = await createPosition({
          variables: {
            position: {
              name: formData.name.trim(),
            },
          },
        });
        if (data?.createPosition) {
          onCreated(data.createPosition);
        }
        reset();
        onOpenChange(false);
      } catch {
        toast.error(t("common.createPositionFailed"));
      }
    },
    [createPosition, onCreated, reset, onOpenChange, t],
  );

  const inputClasses =
    "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-2xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-semibold">
            {t("dialogs.createPosition")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
          <FloatingField label={t("fields.name")} error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder=" "
              disabled={isSubmitting || creating}
              className={inputClasses}
            />
          </FloatingField>
          <DialogActions
            type="submit"
            submitLabel={t("buttons.create")}
            loadingLabel={t("buttons.creating")}
            loading={creating}
            disabled={isSubmitting || !isDirty}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
