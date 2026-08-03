"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { DeleteSkillDocument } from "@/gql/generated/graphql";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import type { SkillItem } from "@/features/skills/types";

interface DeleteSkillDialogProps {
  target: SkillItem | null;
  onClose: () => void;
  onDeleted: (skillId: string) => void;
}

export function DeleteSkillDialog({ target, onClose, onDeleted }: DeleteSkillDialogProps) {
  const [deleteSkill, { loading: deleting }] = useMutation(DeleteSkillDocument);

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await deleteSkill({ variables: { skill: { skillId: target.id } } });
      onDeleted(target.id);
      onClose();
    } catch {}
  }, [target, deleteSkill, onDeleted, onClose]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-lg bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Delete Skill</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete skill <strong>{target?.name}</strong>?
        </p>
        <div
          className="flex flex-row items-center justify-end gap-3 mt-2 py-3"
          style={{ paddingRight: "48px" }}
        >
          <div className="flex w-2/3 gap-3">
            <Button
              variant="ghost"
              className="uppercase flex-1 border border-border py-1.5"
              onClick={onClose}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              className="uppercase flex-1 py-1.5"
              style={{
                boxShadow:
                  "0 1px 5px 0 rgba(0,0,0,0.12),0 2px 2px 0 rgba(0,0,0,0.14),0 3px 1px -2px rgba(0,0,0,0.2)",
              }}
              onClick={handleConfirm}
              disabled={deleting}
            >
              {deleting ? "DELETING..." : "CONFIRM"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
