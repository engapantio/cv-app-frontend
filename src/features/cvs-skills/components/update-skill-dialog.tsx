"use client";

import { useState, useCallback } from "react";
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

  const handleConfirm = useCallback(async () => {
    await onConfirm(skillName, selectedMastery);
    onOpenChange(false);
  }, [skillName, selectedMastery, onConfirm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Update skill</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            value={skillName}
            readOnly
            className="w-full rounded-none opacity-60"
          />
          <Select
            value={selectedMastery}
            onValueChange={(v) => v && setSelectedMastery(v as Mastery)}
          >
            <SelectTrigger className="w-full">
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
            type="submit"
            className="uppercase text-white min-w-30 py-1.5"
            style={{ backgroundColor: "#e53935" }}
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? "CONFIRMING..." : "CONFIRM"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
