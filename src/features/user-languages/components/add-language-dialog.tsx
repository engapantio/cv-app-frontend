"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import type { Proficiency } from "@/gql/generated/graphql";
import { PROFICIENCY_OPTIONS } from "../utils/proficiency-mapping";

interface AddLanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableLanguages: Array<{ id: string; name: string }>;
  onConfirm: (languageName: string, proficiency: Proficiency) => Promise<void>;
  loading: boolean;
}

export function AddLanguageDialog({
  open,
  onOpenChange,
  availableLanguages,
  onConfirm,
  loading,
}: AddLanguageDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedProficiency, setSelectedProficiency] = useState<Proficiency>("A1");

  const handleConfirm = useCallback(async () => {
    if (!selectedLanguage) return;
    try {
      await onConfirm(selectedLanguage, selectedProficiency);
      setSelectedLanguage(null);
      setSelectedProficiency("A1");
      onOpenChange(false);
    } catch {
      toast.error("Failed to add language");
    }
  }, [selectedLanguage, selectedProficiency, onConfirm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Add language</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              Language
            </span>
            <Select value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v)}>
              <SelectTrigger
                className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg"
                disabled={availableLanguages.length === 0}
              >
                <SelectValue
                  placeholder={
                    availableLanguages.length === 0 ? "No available languages" : "Select language"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.name}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              Language proficiency
            </span>
            <Select
              value={selectedProficiency}
              onValueChange={(v) => v && setSelectedProficiency(v as Proficiency)}
            >
              <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg">
                <SelectValue placeholder="Select proficiency" />
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
            disabled={!selectedLanguage || loading}
            onClick={handleConfirm}
          >
            {loading ? "CONFIRMING..." : "CONFIRM"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
