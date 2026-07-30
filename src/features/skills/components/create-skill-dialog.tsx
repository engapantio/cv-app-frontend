"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { CreateSkillDocument, type SkillCategoriesQuery } from "@/gql/generated/graphql";
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
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const [createSkill, { loading: creating }] = useMutation(CreateSkillDocument);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;
    try {
      const { data } = await createSkill({
        variables: {
          skill: {
            name: name.trim(),
            categoryId: categoryId || null,
          },
        },
      });
      if (data?.createSkill) {
        onCreated(data.createSkill);
      }
      setName("");
      setCategoryId(null);
      onOpenChange(false);
    } catch {}
  }, [name, categoryId, createSkill, onCreated, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Create Skill</DialogTitle>
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
              disabled={creating}
              className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg"
            />
          </div>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              Category
            </span>
            <Select value={categoryId ?? ""} onValueChange={(v) => setCategoryId(v || null)}>
              <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
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
            onClick={() => onOpenChange(false)}
          >
            CANCEL
          </Button>
          <Button
            type="button"
            className="uppercase text-white min-w-30 py-1.5"
            style={{ backgroundColor: "#e53935" }}
            disabled={!name.trim() || creating}
            onClick={handleCreate}
          >
            {creating ? "CREATING..." : "CREATE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
