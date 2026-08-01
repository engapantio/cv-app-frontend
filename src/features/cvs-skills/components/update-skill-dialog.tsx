"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
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
  const [selectedMastery, setSelectedMastery] = useState<Mastery>(currentMastery);

  const isDirty = selectedMastery !== currentMastery;

  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm(skillName, selectedMastery);
      onOpenChange(false);
    } catch {
      toast.error("Failed to update skill");
    }
  }, [skillName, selectedMastery, onConfirm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Update skill</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="group relative rounded-none border border-border transition-colors">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground">
              Skill
            </span>
            <Input
              value={skillName}
              readOnly
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none opacity-60 h-12 py-1 text-lg"
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
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
            disabled={!isDirty || loading}
            onClick={handleConfirm}
          >
            {loading ? "CONFIRMING..." : "CONFIRM"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
