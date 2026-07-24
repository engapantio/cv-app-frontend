"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { CreateCvDocument, type CreateCvMutation } from "@/gql/generated/graphql";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
} from "@/components/ui";

const createCvSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  education: z.string().optional(),
});

type CreateCvFormData = z.infer<typeof createCvSchema>;

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
  const [createCv, { loading: creating }] = useMutation(CreateCvDocument);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Create CV</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative mb-5">
            <Input
              placeholder="Name"
              {...register("name")}
              disabled={isSubmitting}
              className="rounded-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div className="relative mb-5">
            <Input
              placeholder="Education"
              {...register("education")}
              disabled={isSubmitting}
              className="rounded-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
            />
            {errors.education && (
              <p className="text-sm text-destructive mt-1">{errors.education.message}</p>
            )}
          </div>
          <div className="relative mb-3">
            <textarea
              placeholder="Description"
              {...register("description")}
              disabled={isSubmitting}
              className="flex w-full bg-background px-4 py-3 text-sm placeholder:text-black/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 border border-input min-h-30 resize-none"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>
          <DialogFooter className="gap-3 border-t-0 bg-transparent mx-0 mb-0 py-0">
            <Button
              type="button"
              variant="ghost"
              className="uppercase min-w-30 border border-border py-1.5"
              onClick={() => onOpenChange(false)}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              className="uppercase text-white min-w-30 py-1.5"
              style={{ backgroundColor: "#e53935" }}
              disabled={isSubmitting || creating}
            >
              {creating ? "CREATING..." : "CREATE"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
