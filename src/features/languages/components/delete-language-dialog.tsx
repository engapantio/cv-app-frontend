"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { DeleteLanguageDocument } from "@/gql/generated/graphql";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import type { LanguageItem } from "@/features/languages/types";

interface DeleteLanguageDialogProps {
  target: LanguageItem | null;
  onClose: () => void;
  onDeleted: (languageId: string) => void;
}

export function DeleteLanguageDialog({ target, onClose, onDeleted }: DeleteLanguageDialogProps) {
  const [deleteLanguage, { loading: deleting }] = useMutation(DeleteLanguageDocument);

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await deleteLanguage({ variables: { language: { languageId: target.id } } });
      onDeleted(target.id);
      onClose();
    } catch {}
  }, [target, deleteLanguage, onDeleted, onClose]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-sm bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Delete Language</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete language <strong>{target?.name}</strong>?
        </p>
        <div
          className="flex flex-row justify-end items-center gap-3 mt-2 py-3"
          style={{ paddingRight: "48px" }}
        >
          <Button
            variant="ghost"
            className="uppercase min-w-30 border border-border py-1.5"
            onClick={onClose}
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            className="w-55 uppercase py-1.5"
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
      </DialogContent>
    </Dialog>
  );
}
