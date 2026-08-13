"use client";

import { useState, useCallback } from "react";
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
import type { Proficiency } from "@/gql/generated/graphql";
import { PROFICIENCY_OPTIONS } from "../utils/proficiency-mapping";

interface UpdateLanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLanguage: { name: string; proficiency: Proficiency } | null;
  onConfirm: (name: string, proficiency: Proficiency) => Promise<void>;
  loading: boolean;
}

export function UpdateLanguageDialog({
  open,
  onOpenChange,
  currentLanguage,
  onConfirm,
  loading,
}: UpdateLanguageDialogProps) {
  const t = useTranslations();
  const initialProficiency = currentLanguage?.proficiency || "A1";
  const [selectedProficiency, setSelectedProficiency] = useState<Proficiency>(initialProficiency);

  const isDirty = selectedProficiency !== initialProficiency;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        onOpenChange(false);
      } else {
        if (currentLanguage) {
          setSelectedProficiency(currentLanguage.proficiency);
        }
        onOpenChange(true);
      }
    },
    [currentLanguage, onOpenChange],
  );

  const handleConfirm = useCallback(async () => {
    if (!currentLanguage) return;
    await onConfirm(currentLanguage.name, selectedProficiency);
    onOpenChange(false);
  }, [currentLanguage, selectedProficiency, onConfirm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.updateAssignedLanguage")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon transition-colors group-focus-within:text-primary">
              {t("fields.name")}
            </span>
            <div className="w-full border-0 bg-transparent px-3 h-12 text-lg text-muted-foreground flex items-center">
              {currentLanguage?.name || ""}
            </div>
          </div>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon transition-colors group-focus-within:text-primary">
              {t("fields.proficiency")}
            </span>
            <Select
              value={selectedProficiency}
              onValueChange={(v) => v && setSelectedProficiency(v as Proficiency)}
            >
              <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none data-[size=default]:h-12 text-lg">
                <SelectValue placeholder={t("placeholders.selectProficiency")} />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_OPTIONS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogActions
          submitLabel={t("buttons.confirm")}
          loadingLabel={t("buttons.updating")}
          loading={loading}
          disabled={loading || !isDirty}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
