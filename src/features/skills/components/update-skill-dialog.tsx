"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UpdateSkillDocument, type SkillCategoriesQuery } from "@/gql/generated/graphql";
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
import type { SkillItem } from "@/features/skills/types";

interface UpdateSkillDialogProps {
  target: SkillItem | null;
  onClose: () => void;
  categories: SkillCategoriesQuery["skillCategories"];
  onUpdated: (result: {
    id: string;
    created_at: string;
    name: string;
    category_name: string | null;
    category_parent_name: string | null;
  }) => void;
}

export function UpdateSkillDialog({
  target,
  onClose,
  categories,
  onUpdated,
}: UpdateSkillDialogProps) {
  const t = useTranslations();
  const initialCategoryName = target
    ? (categories.find((c) => c.id === target.category?.id)?.name ?? null)
    : null;
  const [name, setName] = useState(target?.name ?? "");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(
    initialCategoryName,
  );
  const [categoryOpen, setCategoryOpen] = useState(false);

  const isDirty =
    name.trim() !== (target?.name ?? "").trim() || selectedCategoryName !== initialCategoryName;

  const [updateSkill, { loading: updating }] = useMutation(UpdateSkillDocument);

  const handleUpdate = useCallback(async () => {
    if (!target || !name.trim()) return;
    try {
      const categoryId = categories.find((c) => c.name === selectedCategoryName)?.id ?? null;
      const { data } = await updateSkill({
        variables: {
          skill: {
            skillId: target.id,
            name: name.trim(),
            categoryId,
          },
        },
      });
      if (data?.updateSkill) {
        onUpdated(data.updateSkill);
      }
      onClose();
    } catch {
      toast.error(t("common.updateSkillFailed"));
      onClose();
    }
  }, [target, name, selectedCategoryName, categories, updateSkill, onUpdated, onClose, t]);

  const inputClasses =
    "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";
  const selectTriggerClasses =
    "w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-sm";

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.updateSkill")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <FloatingField label={t("fields.name")}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              disabled={updating}
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
          submitLabel={t("buttons.update")}
          loadingLabel={t("buttons.updating")}
          loading={updating}
          disabled={!name.trim() || !isDirty}
          onCancel={onClose}
          onSubmit={handleUpdate}
        />
      </DialogContent>
    </Dialog>
  );
}
