"use client";

import { useState, useCallback, useMemo } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CreateSkillDocument } from "@/gql/generated/graphql";
import { prependCreated } from "@/lib/apollo/cache-utils";
import { useSkillCategoriesList } from "@/lib/apollo/use-skill-categories-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { DialogActions, FloatingField } from "@/components/shared";

interface CreateSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: {
    id: string;
    created_at: string;
    name: string;
    category_name: string | null;
    category_parent_name: string | null;
  }) => void;
}

export function CreateSkillDialog({ open, onOpenChange, onCreated }: CreateSkillDialogProps) {
  const t = useTranslations();
  const { categories } = useSkillCategoriesList();
  const [name, setName] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const validationMessages = useMemo(
    () => ({
      categoryRequired: t("validation.categoryRequired"),
    }),
    [t],
  );

  const skillSchema = useMemo(
    () =>
      z.object({
        selectedCategoryName: z.string().min(1, validationMessages.categoryRequired),
      }),
    [validationMessages],
  );

  const [createSkill, { loading: creating }] = useMutation(CreateSkillDocument, {
    update(cache, { data }) {
      if (!data?.createSkill) return;
      prependCreated(
        cache,
        data.createSkill,
        gql`
          fragment NewSkill on Skill {
            id
            created_at
            name
            category_name
            category_parent_name
          }
        `,
        "skills",
      );
    },
  });

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;
    const parsed = skillSchema.safeParse({ selectedCategoryName: selectedCategoryName ?? "" });
    if (!parsed.success) {
      setCategoryError(parsed.error.flatten().fieldErrors.selectedCategoryName?.[0] ?? null);
      return;
    }
    setCategoryError(null);
    try {
      const categoryId = categories.find((c) => c.name === selectedCategoryName)?.id ?? null;
      const { data } = await createSkill({
        variables: {
          skill: {
            name: name.trim(),
            categoryId,
          },
        },
      });
      if (data?.createSkill) {
        onCreated(data.createSkill);
      }
      setName("");
      setSelectedCategoryName(null);
      setCategoryError(null);
      onOpenChange(false);
    } catch {
      toast.error(t("common.createSkillFailed"));
    }
  }, [
    name,
    selectedCategoryName,
    categories,
    skillSchema,
    createSkill,
    onCreated,
    onOpenChange,
    t,
  ]);

  const inputClasses =
    "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";
  const selectTriggerClasses =
    "w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none data-[size=default]:h-12 py-1 text-sm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-2xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-semibold">
            {t("dialogs.createSkill")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4 pb-2">
          <FloatingField label={t("fields.name")}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              disabled={creating}
              className={inputClasses}
            />
          </FloatingField>
          <FloatingField
            label={t("fields.category")}
            variant="select"
            active={!!selectedCategoryName || categoryOpen}
            error={categoryError ?? undefined}
          >
            <Select
              value={selectedCategoryName ?? ""}
              onValueChange={(v) => {
                setSelectedCategoryName(v || null);
                if (v) setCategoryError(null);
              }}
              onOpenChange={setCategoryOpen}
            >
              <SelectTrigger className={selectTriggerClasses}>
                <SelectValue placeholder={t("placeholders.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FloatingField>
        </div>
        <DialogActions
          submitLabel={t("buttons.create")}
          loadingLabel={t("buttons.creating")}
          loading={creating}
          disabled={!name.trim()}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleCreate}
        />
      </DialogContent>
    </Dialog>
  );
}
