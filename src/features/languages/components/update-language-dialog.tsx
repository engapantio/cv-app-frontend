"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UpdateLanguageDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@/components/ui";
import { DialogActions, FloatingField } from "@/components/shared";
import type { LanguageItem } from "@/features/languages/types";

type UpdateLanguageFormData = {
  name: string;
  iso2: string;
  nativeName?: string;
};

interface UpdateLanguageDialogProps {
  target: LanguageItem | null;
  onClose: () => void;
  onUpdated: (result: {
    id: string;
    created_at: string;
    iso2: string;
    name: string;
    native_name: string | null;
  }) => void;
}

export function UpdateLanguageDialog({ target, onClose, onUpdated }: UpdateLanguageDialogProps) {
  const t = useTranslations();
  const [updateLanguage, { loading: updating }] = useMutation(UpdateLanguageDocument);

  const validation = useMemo(
    () => ({
      requiredName: t("validation.nameRequired"),
      requiredIso2: t("validation.iso2Required"),
      iso2Length: t("validation.iso2Length"),
    }),
    [t],
  );

  const updateLanguageSchema = useMemo(
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
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateLanguageFormData>({
    resolver: zodResolver(updateLanguageSchema),
    defaultValues: {
      name: target?.name ?? "",
      iso2: target?.iso2 ?? "",
      nativeName: target?.native_name ?? "",
    },
  });

  const onSubmit = useCallback(
    async (formData: UpdateLanguageFormData) => {
      if (!target) return;
      try {
        const { data } = await updateLanguage({
          variables: {
            language: {
              languageId: target.id,
              name: formData.name.trim(),
              iso2: formData.iso2.trim(),
              native_name: formData.nativeName?.trim() || null,
            },
          },
        });
        if (data?.updateLanguage) {
          onUpdated(data.updateLanguage);
        }
        onClose();
      } catch {
        toast.error(t("common.updateLanguageFailed"));
        onClose();
      }
    },
    [target, updateLanguage, onUpdated, onClose, t],
  );

  const inputClasses =
    "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.updateLanguage")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <FloatingField label={t("fields.name")} error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder=" "
              disabled={isSubmitting || updating}
              className={inputClasses}
            />
          </FloatingField>
          <FloatingField label={t("fields.nativeName")} error={errors.nativeName?.message}>
            <Input
              {...register("nativeName")}
              placeholder=" "
              disabled={isSubmitting || updating}
              className={inputClasses}
            />
          </FloatingField>
          <FloatingField label={t("fields.iso2")} error={errors.iso2?.message}>
            <Input
              {...register("iso2")}
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
            className="pt-1"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
