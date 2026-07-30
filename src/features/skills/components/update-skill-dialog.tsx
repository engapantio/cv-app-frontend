"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { UpdateSkillDocument, type SkillCategoriesQuery } from "@/gql/generated/graphql";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
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
  const initialCategoryName = target
    ? (categories.find((c) => c.id === target.category?.id)?.name ?? null)
    : null;
  const [name, setName] = useState(target?.name ?? "");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(
    initialCategoryName,
  );

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
      toast.error("Failed to update skill");
      onClose();
    }
  }, [target, name, selectedCategoryName, categories, updateSkill, onUpdated, onClose]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Update Skill</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              Name
            </span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              disabled={updating}
              className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg"
            />
          </div>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              Category
            </span>
            <Select
              value={selectedCategoryName ?? ""}
              onValueChange={(v) => setSelectedCategoryName(v || null)}
            >
              <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-3 border-t-0 bg-transparent mx-0 mb-0 py-0">
          <Button
            type="button"
            variant="ghost"
            className="uppercase min-w-30 border border-border py-1.5"
            onClick={onClose}
          >
            CANCEL
          </Button>
          <Button
            type="button"
            className="uppercase text-white min-w-30 py-1.5"
            style={{ backgroundColor: "#e53935" }}
            disabled={!name.trim() || updating}
            onClick={handleUpdate}
          >
            {updating ? "UPDATING..." : "UPDATE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
