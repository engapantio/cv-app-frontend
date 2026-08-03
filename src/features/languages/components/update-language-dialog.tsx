"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { UpdateLanguageDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@/components/ui";
import { DialogActions, FloatingField } from "@/components/shared";
import type { LanguageItem } from "@/features/languages/types";

const updateLanguageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  iso2: z.string().min(1, "ISO2 is required").length(2, "ISO2 must be exactly 2 characters"),
  nativeName: z.string().optional(),
});

type UpdateLanguageFormData = z.infer<typeof updateLanguageSchema>;

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
  const [updateLanguage, { loading: updating }] = useMutation(UpdateLanguageDocument);

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
        toast.error("Failed to update language");
        onClose();
      }
    },
    [target, updateLanguage, onUpdated, onClose],
  );

  const inputClasses =
    "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Update Language</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <FloatingField label="Name" error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder=" "
              disabled={isSubmitting || updating}
              className={inputClasses}
            />
          </FloatingField>
          <FloatingField label="Native Name" error={errors.nativeName?.message}>
            <Input
              {...register("nativeName")}
              placeholder=" "
              disabled={isSubmitting || updating}
              className={inputClasses}
            />
          </FloatingField>
          <FloatingField label="ISO2" error={errors.iso2?.message}>
            <Input
              {...register("iso2")}
              placeholder=" "
              disabled={isSubmitting || updating}
              className={inputClasses}
            />
          </FloatingField>
          <DialogActions
            type="submit"
            submitLabel="UPDATE"
            loadingLabel="UPDATING..."
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
