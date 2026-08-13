"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
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
import { DialogActions } from "@/components/shared/dialog-actions";
import type { Mastery } from "@/gql/generated/graphql";
import { MASTERY_OPTIONS } from "../utils/mastery-mapping";

interface UpdateSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillName: string;
  currentMastery: Mastery;
  onConfirm: (skillName: string, mastery: Mastery) => Promise<void>;
  loading: boolean;
}

export function UpdateSkillDialog({
  open,
  onOpenChange,
  skillName,
  currentMastery,
  onConfirm,
  loading,
}: UpdateSkillDialogProps) {
  const t = useTranslations();
  const [selectedMastery, setSelectedMastery] = useState<Mastery>(currentMastery);

  const isDirty = selectedMastery !== currentMastery;

  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm(skillName, selectedMastery);
      onOpenChange(false);
    } catch {
      toast.error(t("common.updateAssignedSkillFailed"));
    }
  }, [skillName, selectedMastery, onConfirm, onOpenChange, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.updateAssignedSkill")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="group relative rounded-none border border-border transition-colors">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon">
              {t("fields.name")}
            </span>
            <Input
              value={skillName}
              readOnly
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none opacity-60 h-12 text-lg"
            />
          </div>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon transition-colors group-focus-within:text-primary">
              {t("fields.mastery")}
            </span>
            <Select
              value={selectedMastery}
              onValueChange={(v) => v && setSelectedMastery(v as Mastery)}
            >
              <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none data-[size=default]:h-12 text-lg">
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
          disabled={!isDirty || loading}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
