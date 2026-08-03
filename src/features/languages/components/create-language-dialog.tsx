"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { CreateLanguageDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@/components/ui";
import { DialogActions, FloatingField } from "@/components/shared";

const createLanguageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  iso2: z.string().min(1, "ISO2 is required").length(2, "ISO2 must be exactly 2 characters"),
  nativeName: z.string().optional(),
});

type CreateLanguageFormData = z.infer<typeof createLanguageSchema>;

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
  const [createLanguage, { loading: creating }] = useMutation(CreateLanguageDocument);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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
        toast.error("Failed to create language");
      }
    },
    [createLanguage, onCreated, reset, onOpenChange],
  );

  const inputClasses =
    "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Create Language</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <FloatingField label="Name" error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder=" "
              disabled={isSubmitting || creating}
              className={inputClasses}
            />
          </FloatingField>
          <FloatingField label="Native Name" error={errors.nativeName?.message}>
            <Input
              {...register("nativeName")}
              placeholder=" "
              disabled={isSubmitting || creating}
              className={inputClasses}
            />
          </FloatingField>
          <FloatingField label="ISO2" error={errors.iso2?.message}>
            <Input
              {...register("iso2")}
              placeholder=" "
              disabled={isSubmitting || creating}
              className={inputClasses}
            />
          </FloatingField>
          <DialogActions
            type="submit"
            submitLabel="CREATE"
            loadingLabel="CREATING..."
            loading={creating}
            disabled={isSubmitting}
            onCancel={() => onOpenChange(false)}
            className="pt-1"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
