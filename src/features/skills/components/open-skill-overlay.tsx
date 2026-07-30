"use client";

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import type { SkillItem } from "@/features/skills/types";

interface OpenSkillOverlayProps {
  target: SkillItem | null;
  onClose: () => void;
}

export function OpenSkillOverlay({ target, onClose }: OpenSkillOverlayProps) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Skill</DialogTitle>
        </DialogHeader>
        {target && (
          <div className="space-y-6 py-4">
            <div className="group relative rounded-none border border-border transition-colors">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground">
                Name
              </span>
              <div className="h-12 py-1 px-3 flex items-center text-base text-foreground">
                {target.name}
              </div>
            </div>
            <div className="group relative rounded-none border border-border transition-colors">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground">
                Type
              </span>
              <div className="h-12 py-1 px-3 flex items-center text-base text-foreground">
                {target.category_parent_name ?? "—"}
              </div>
            </div>
            <div className="group relative rounded-none border border-border transition-colors">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground">
                Category
              </span>
              <div className="h-12 py-1 px-3 flex items-center text-base text-foreground">
                {target.category_name ?? "—"}
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            className="uppercase min-w-30 border border-border py-1.5"
            onClick={onClose}
          >
            CLOSE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
