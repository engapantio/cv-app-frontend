"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { UpdateCvDocument, type CvQuery } from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type CvData = CvQuery["cv"];

const cvDetailsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  education: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

type CvDetailsFormData = z.infer<typeof cvDetailsSchema>;

export default function CvDetailsClient({
  cvId,
  initialCv,
  serverError,
}: {
  cvId: string;
  initialCv: CvData | null;
  serverError: string | null;
}) {
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
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <CvDetailsForm cv={initialCv} cvId={cvId} />;
}

function CvDetailsForm({ cv, cvId }: { cv: NonNullable<CvData>; cvId: string }) {
  const { canEdit } = usePermissions(cv.user?.id);
  const [updateCv, { loading: updating }] = useMutation(UpdateCvDocument);

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
      toast("CV updated successfully");
    } catch {
      toast("Failed to update CV");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-6 pl-[200px]">
      <div className="relative">
        <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
          <span className="absolute -top-2.5 left-3 bg-background px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
            Name
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
          <span className="absolute -top-2.5 left-3 bg-background px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
            Education
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
          <span className="absolute -top-2.5 left-3 bg-background px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
            Description
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
          {updating ? "UPDATING..." : "UPDATE"}
        </Button>
      </div>
    </form>
  );
}
