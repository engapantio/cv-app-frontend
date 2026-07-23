"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { CreateCvDocument, type CreateCvMutation } from "@/gql/generated/graphql";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from "@/components/ui";

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
      } catch {
      }
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
            <div className="relative rounded-none border border-border transition-colors focus-within:border-primary">
              <Input
                {...register("name")}
                placeholder=" "
                disabled={isSubmitting}
                className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none pt-5 pb-1"
              />
              <span className="absolute left-3 bg-background px-1 text-xs text-muted-foreground transition-all duration-200 pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary -top-2.5 translate-y-0">
                Name
              </span>
            </div>
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>
          <div className="relative mb-5">
            <div className="relative rounded-none border border-border transition-colors focus-within:border-primary">
              <Input
                {...register("education")}
                placeholder=" "
                disabled={isSubmitting}
                className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none pt-5 pb-1"
              />
              <span className="absolute left-3 bg-background px-1 text-xs text-muted-foreground transition-all duration-200 pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary -top-2.5 translate-y-0">
                Education
              </span>
            </div>
            {errors.education && (
              <p className="text-sm text-destructive mt-1">{errors.education.message}</p>
            )}
          </div>
          <div className="relative mb-3">
            <div className="relative rounded-none border border-border transition-colors focus-within:border-primary">
              <textarea
                {...register("description")}
                placeholder=" "
                disabled={isSubmitting}
                className="peer flex w-full bg-background px-4 pt-6 pb-3 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 border-0 min-h-30 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="absolute left-3 bg-background px-1 text-xs text-muted-foreground transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary -top-2.5 translate-y-0">
                Description
              </span>
            </div>
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
