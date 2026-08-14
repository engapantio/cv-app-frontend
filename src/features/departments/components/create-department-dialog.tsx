"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CreateDepartmentDocument } from "@/gql/generated/graphql";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@/components/ui";
import { DialogActions, FloatingField } from "@/components/shared";

type CreateDepartmentFormData = {
  name: string;
};

interface CreateDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: { id: string; created_at: string; name: string }) => void;
}

export function CreateDepartmentDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateDepartmentDialogProps) {
  const t = useTranslations();
  const [createDepartment, { loading: creating }] = useMutation(CreateDepartmentDocument, {
    update(cache, { data }) {
      if (!data?.createDepartment) return;
      cache.modify({
        fields: {
          departments(existingRefs = []) {
            const newRef = cache.writeFragment({
              data: data.createDepartment,
              fragment: gql`
                fragment NewDepartment on Department {
                  id
                  created_at
                  name
                }
              `,
            });
            return [...existingRefs, newRef];
          },
        },
      });
    },
  });

  const validation = useMemo(() => ({ requiredName: t("validation.nameRequired") }), [t]);

  const createDepartmentSchema = useMemo(
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
  } = useForm<CreateDepartmentFormData>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = useCallback(
    async (formData: CreateDepartmentFormData) => {
      try {
        const { data } = await createDepartment({
          variables: {
            department: {
              name: formData.name.trim(),
            },
          },
        });
        if (data?.createDepartment) {
          onCreated(data.createDepartment);
        }
        reset();
        onOpenChange(false);
      } catch {
        toast.error(t("common.createDepartmentFailed"));
      }
    },
    [createDepartment, onCreated, reset, onOpenChange, t],
  );

  const inputClasses =
    "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-2xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.createDepartment")}
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
