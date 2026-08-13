"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { DialogActions } from "@/components/shared/dialog-actions";
import type { Mastery } from "@/gql/generated/graphql";
import { MASTERY_OPTIONS } from "../utils/mastery-mapping";

interface AddSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSkills: Array<{
    name: string;
    category_name: string | null;
    category_parent_name: string | null;
  }>;
  onConfirm: (skillName: string, mastery: Mastery) => Promise<void>;
  loading: boolean;
}

export function AddSkillDialog({
  open,
  onOpenChange,
  availableSkills,
  onConfirm,
  loading,
}: AddSkillDialogProps) {
  const t = useTranslations();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedMastery, setSelectedMastery] = useState<Mastery>("Novice");

  const handleConfirm = useCallback(async () => {
    if (!selectedSkill) return;
    const skill = selectedSkill;
    const mastery = selectedMastery;
    try {
      await onConfirm(skill, mastery);
      setSelectedSkill(null);
      setSelectedMastery("Novice");
      onOpenChange(false);
    } catch {
      toast.error(t("common.addSkillFailed"));
    }
  }, [selectedSkill, selectedMastery, onConfirm, onOpenChange, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.addSkill")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon transition-colors group-focus-within:text-primary">
              {t("fields.name")}
            </span>
            <Select value={selectedSkill} onValueChange={(v) => setSelectedSkill(v)}>
              <SelectTrigger
                className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none data-[size=default]:h-12 py-1 text-lg"
                disabled={availableSkills.length === 0}
              >
                <SelectValue
                  placeholder={
                    availableSkills.length === 0
                      ? t("common.noAvailableSkills")
                      : t("placeholders.selectSkill")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableSkills.map((skill) => (
                  <SelectItem key={skill.name} value={skill.name}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon transition-colors group-focus-within:text-primary">
              {t("fields.mastery")}
            </span>
            <Select
              value={selectedMastery}
              onValueChange={(v) => v && setSelectedMastery(v as Mastery)}
            >
              <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none data-[size=default]:h-12 py-1 text-lg">
                <SelectValue placeholder={t("placeholders.selectMastery")} />
              </SelectTrigger>
              <SelectContent>
                {MASTERY_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogActions
          submitLabel={t("buttons.confirm")}
          loadingLabel={t("buttons.confirming")}
          loading={loading}
          disabled={!selectedSkill || loading}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
