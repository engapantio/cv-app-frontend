"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { UpdateLanguageDocument } from "@/gql/generated/graphql";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
} from "@/components/ui";
import type { LanguageItem } from "@/features/languages/types";

interface UpdateLanguageDialogProps {
  target: LanguageItem | null;
  onClose: () => void;
  onUpdated: (result: {
    id: string;
    created_at: string;
    iso2: string;
    name: string;
    native_name: string | null;
  }) => void;
}

export function UpdateLanguageDialog({ target, onClose, onUpdated }: UpdateLanguageDialogProps) {
  const [name, setName] = useState(target?.name ?? "");
  const [iso2, setIso2] = useState(target?.iso2 ?? "");
  const [nativeName, setNativeName] = useState(target?.native_name ?? "");

  const isDirty =
    name.trim() !== (target?.name ?? "").trim() ||
    iso2.trim() !== (target?.iso2 ?? "").trim() ||
    nativeName.trim() !== (target?.native_name ?? "").trim();

  const [updateLanguage, { loading: updating }] = useMutation(UpdateLanguageDocument);

  const handleUpdate = useCallback(async () => {
    if (!target || !name.trim() || !iso2.trim()) return;
    try {
      const { data } = await updateLanguage({
        variables: {
          language: {
            languageId: target.id,
            name: name.trim(),
            iso2: iso2.trim(),
            native_name: nativeName.trim() || null,
          },
        },
      });
      if (data?.updateLanguage) {
        onUpdated(data.updateLanguage);
      }
      onClose();
    } catch {
      toast.error("Failed to update language");
      onClose();
    }
  }, [target, name, iso2, nativeName, updateLanguage, onUpdated, onClose]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Update Language</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              Name
            </span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              disabled={updating}
              className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg"
            />
          </div>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              ISO2
            </span>
            <Input
              value={iso2}
              onChange={(e) => setIso2(e.target.value)}
              placeholder=" "
              disabled={updating}
              className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg"
            />
          </div>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              Native Name
            </span>
            <Input
              value={nativeName}
              onChange={(e) => setNativeName(e.target.value)}
              placeholder=" "
              disabled={updating}
              className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg"
            />
          </div>
        </div>
        <DialogFooter className="gap-3 border-t-0 bg-transparent mx-0 mb-0 py-0">
          <Button
            type="button"
            variant="ghost"
            className="uppercase min-w-30 border border-border py-1.5"
            onClick={onClose}
          >
            CANCEL
          </Button>
          <Button
            type="button"
            className="uppercase text-white min-w-30 py-1.5"
            style={{ backgroundColor: "#e53935" }}
            disabled={!name.trim() || !iso2.trim() || !isDirty || updating}
            onClick={handleUpdate}
          >
            {updating ? "UPDATING..." : "UPDATE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
