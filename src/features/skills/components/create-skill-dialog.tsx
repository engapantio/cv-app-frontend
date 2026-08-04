"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CreateSkillDocument, type SkillCategoriesQuery } from "@/gql/generated/graphql";
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
  categories: SkillCategoriesQuery["skillCategories"];
  onCreated: (result: {
    id: string;
    created_at: string;
    name: string;
    category_name: string | null;
    category_parent_name: string | null;
  }) => void;
}

export function CreateSkillDialog({
  open,
  onOpenChange,
  categories,
  onCreated,
}: CreateSkillDialogProps) {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [createSkill, { loading: creating }] = useMutation(CreateSkillDocument);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;
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
      onOpenChange(false);
    } catch {
      toast.error(t("common.createSkillFailed"));
    }
  }, [name, selectedCategoryName, categories, createSkill, onCreated, onOpenChange, t]);

  const inputClasses =
    "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";
  const selectTriggerClasses =
    "w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-sm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.createSkill")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
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
          >
            <Select
              value={selectedCategoryName ?? ""}
              onValueChange={(v) => setSelectedCategoryName(v || null)}
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
