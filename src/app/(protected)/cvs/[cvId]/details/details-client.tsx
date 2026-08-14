"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { UpdateCvDocument, type CvQuery } from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FloatingField } from "@/components/shared/floating-field";
import { toast } from "sonner";

type CvData = CvQuery["cv"];

type CvDetailsFormData = {
  name: string;
  education?: string;
  description: string;
};

export default function CvDetailsClient({
  cvId,
  initialCv,
  serverError,
}: {
  cvId: string;
  initialCv: CvData | null;
  serverError: string | null;
}) {
  const t = useTranslations("common");

  if (serverError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive">{serverError}</p>
      </div>
    );
  }

  if (!initialCv) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return <CvDetailsForm cv={initialCv} cvId={cvId} />;
}

function CvDetailsForm({ cv, cvId }: { cv: NonNullable<CvData>; cvId: string }) {
  const t = useTranslations();
  const { canEdit } = usePermissions(cv.user?.id);
  const [updateCv, { loading: updating }] = useMutation(UpdateCvDocument);

  const validation = useMemo(
    () => ({
      nameRequired: t("validation.nameRequired"),
      descriptionRequired: t("validation.descriptionRequired"),
    }),
    [t],
  );

  const cvDetailsSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, validation.nameRequired),
        education: z.string().optional(),
        description: z.string().min(1, validation.descriptionRequired),
      }),
    [validation],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CvDetailsFormData>({
    resolver: zodResolver(cvDetailsSchema),
    defaultValues: {
      name: cv?.name ?? "",
      education: cv?.education ?? "",
      description: cv?.description ?? "",
    },
  });

  const handleSave = async (formData: CvDetailsFormData) => {
    try {
      await updateCv({
        variables: {
          cv: {
            cvId,
            name: formData.name,
            education: formData.education || null,
            description: formData.description,
          },
        },
      });
      reset(formData);
      toast(t("common.updateCvSuccess"));
    } catch {
      toast(t("common.updateCvFailed"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleSave)}
      className="space-y-6 max-md:pl-0 md:max-[1439px]:pl-0 min-[1440px]:pl-25 min-[1440px]:pr-25"
    >
      <div className="relative">
        <FloatingField label={t("fields.name")} error={errors.name?.message}>
          <Input
            {...register("name")}
            placeholder=" "
            readOnly={!canEdit}
            disabled={isSubmitting}
            className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-3"
          />
        </FloatingField>
      </div>

      <div className="relative">
        <FloatingField label={t("fields.education")} error={errors.education?.message}>
          <Input
            {...register("education")}
            placeholder=" "
            readOnly={!canEdit}
            disabled={isSubmitting}
            className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-3"
          />
        </FloatingField>
      </div>

      <div className="relative">
        <FloatingField
          label={t("fields.description")}
          variant="textarea"
          error={errors.description?.message}
        >
          <Textarea
            {...register("description")}
            placeholder=" "
            readOnly={!canEdit}
            disabled={isSubmitting}
            className="peer flex w-full bg-background px-4 pt-6 pb-3 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 border-0 min-h-46.25 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </FloatingField>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="uppercase text-white w-2/5 py-1.5 cursor-pointer"
          style={
            !canEdit || isSubmitting || updating || !isDirty
              ? undefined
              : { backgroundColor: "#e53935" }
          }
          disabled={!canEdit || isSubmitting || updating || !isDirty}
        >
          {updating ? t("buttons.updating") : t("buttons.update")}
        </Button>
      </div>
    </form>
  );
}
