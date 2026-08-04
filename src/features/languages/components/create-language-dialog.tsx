"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CreateLanguageDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@/components/ui";
import { DialogActions, FloatingField } from "@/components/shared";

type CreateLanguageFormData = {
  name: string;
  iso2: string;
  nativeName?: string;
};

interface CreateLanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: {
    id: string;
    created_at: string;
    iso2: string;
    name: string;
    native_name: string | null;
  }) => void;
}

export function CreateLanguageDialog({ open, onOpenChange, onCreated }: CreateLanguageDialogProps) {
  const t = useTranslations();
  const [createLanguage, { loading: creating }] = useMutation(CreateLanguageDocument);

  const validation = useMemo(
    () => ({
      requiredName: t("validation.nameRequired"),
      requiredIso2: t("validation.iso2Required"),
      iso2Length: t("validation.iso2Length"),
    }),
    [t],
  );

  const createLanguageSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, validation.requiredName),
        iso2: z.string().min(1, validation.requiredIso2).length(2, validation.iso2Length),
        nativeName: z.string().optional(),
      }),
    [validation],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateLanguageFormData>({
    resolver: zodResolver(createLanguageSchema),
    defaultValues: { name: "", iso2: "", nativeName: "" },
  });

  const onSubmit = useCallback(
    async (formData: CreateLanguageFormData) => {
      try {
        const { data } = await createLanguage({
          variables: {
            language: {
              name: formData.name.trim(),
              iso2: formData.iso2.trim(),
              native_name: formData.nativeName?.trim() || null,
            },
          },
        });
        if (data?.createLanguage) {
          onCreated(data.createLanguage);
        }
        reset();
        onOpenChange(false);
      } catch {
        toast.error(t("common.createLanguageFailed"));
      }
    },
    [createLanguage, onCreated, reset, onOpenChange, t],
  );

  const inputClasses =
    "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.createLanguage")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <FloatingField label={t("fields.name")} error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder=" "
              disabled={isSubmitting || creating}
              className={inputClasses}
            />
          </FloatingField>
          <FloatingField label={t("fields.nativeName")} error={errors.nativeName?.message}>
            <Input
              {...register("nativeName")}
              placeholder=" "
              disabled={isSubmitting || creating}
              className={inputClasses}
            />
          </FloatingField>
          <FloatingField label={t("fields.iso2")} error={errors.iso2?.message}>
            <Input
              {...register("iso2")}
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
            className="pt-1"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
