"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { CreateCvDocument, type CreateCvMutation } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input, Textarea } from "@/components/ui";
import { DialogActions, FloatingField } from "@/components/shared";

type CreateCvFormData = {
  name: string;
  description: string;
  education?: string;
};

const inputClasses =
  "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-3";

export function CreateCvDialog({
  open,
  onOpenChange,
  userId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onCreated: (newCv: CreateCvMutation["createCv"]) => void;
}) {
  const t = useTranslations();
  const [createCv, { loading: creating }] = useMutation(CreateCvDocument);

  const validation = useMemo(
    () => ({
      nameRequired: t("validation.nameRequired"),
      descriptionRequired: t("validation.descriptionRequired"),
    }),
    [t],
  );

  const createCvSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, validation.nameRequired),
        description: z.string().min(1, validation.descriptionRequired),
        education: z.string().optional(),
      }),
    [validation],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateCvFormData>({
    resolver: zodResolver(createCvSchema),
    defaultValues: { name: "", description: "", education: "" },
  });

  const onSubmit = useCallback(
    async (formData: CreateCvFormData) => {
      try {
        const { data } = await createCv({
          variables: {
            cv: {
              name: formData.name,
              description: formData.description,
              education: formData.education || null,
              userId,
            },
          },
        });
        if (data?.createCv) {
          onCreated(data.createCv);
        }
        onOpenChange(false);
        reset();
      } catch {}
    },
    [createCv, userId, onCreated, onOpenChange, reset],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-2xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.createCv")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <FloatingField label={t("fields.name")} error={errors.name?.message}>
              <Input
                {...register("name")}
                placeholder=" "
                disabled={isSubmitting}
                className={inputClasses}
              />
            </FloatingField>
          </div>
          <div className="mb-5">
            <FloatingField label={t("fields.education")} error={errors.education?.message}>
              <Input
                {...register("education")}
                placeholder=" "
                disabled={isSubmitting}
                className={inputClasses}
              />
            </FloatingField>
          </div>
          <div className="mb-5">
            <FloatingField
              label={t("fields.description")}
              variant="textarea"
              error={errors.description?.message}
            >
              <Textarea
                {...register("description")}
                placeholder=" "
                disabled={isSubmitting}
                className="peer flex w-full bg-background px-4 pt-6 pb-3 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 border-0 min-h-25 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </FloatingField>
          </div>
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
