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
    <form onSubmit={handleSubmit(handleSave)} className="space-y-6 pl-[200px]">
      <div className="relative">
        <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
          <span className="absolute -top-2.5 left-3 bg-background px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)] transition-colors group-focus-within:text-primary">
            {t("fields.name")}
          </span>
          <Input
            {...register("name")}
            readOnly={!canEdit}
            disabled={isSubmitting}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
          />
        </div>
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div className="relative">
        <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
          <span className="absolute -top-2.5 left-3 bg-background px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)] transition-colors group-focus-within:text-primary">
            {t("fields.education")}
          </span>
          <Input
            {...register("education")}
            readOnly={!canEdit}
            disabled={isSubmitting}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
          />
        </div>
        {errors.education && (
          <p className="text-sm text-destructive mt-1">{errors.education.message}</p>
        )}
      </div>

      <div className="relative">
        <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
          <span className="absolute -top-2.5 left-3 bg-background px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)] transition-colors group-focus-within:text-primary">
            {t("fields.description")}
          </span>
          <textarea
            {...register("description")}
            readOnly={!canEdit}
            disabled={isSubmitting}
            className="flex w-full bg-background px-4 py-3 text-sm placeholder:text-black/60 dark:placeholder:text-white/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 border-0 min-h-[185px] resize-none"
          />
        </div>
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="uppercase text-white w-2/5 py-1.5 cursor-pointer"
          style={{ backgroundColor: "#e53935" }}
          disabled={!canEdit || isSubmitting || updating || !isDirty}
        >
          {updating ? t("buttons.updating") : t("buttons.update")}
        </Button>
      </div>
    </form>
  );
}
