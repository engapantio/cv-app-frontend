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
      toast.error("Failed to add skill");
    }
  }, [selectedSkill, selectedMastery, onConfirm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Add skill</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              Skill
            </span>
            <Select value={selectedSkill} onValueChange={(v) => setSelectedSkill(v)}>
              <SelectTrigger
                className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg"
                disabled={availableSkills.length === 0}
              >
                <SelectValue
                  placeholder={
                    availableSkills.length === 0 ? "No available skills" : "Select skill"
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
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              Mastery
            </span>
            <Select
              value={selectedMastery}
              onValueChange={(v) => v && setSelectedMastery(v as Mastery)}
            >
              <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg">
                <SelectValue placeholder="Select mastery" />
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
            disabled={!selectedSkill || loading}
            onClick={handleConfirm}
          >
            {loading ? "CONFIRMING..." : "CONFIRM"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
