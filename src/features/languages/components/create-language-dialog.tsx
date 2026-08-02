"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { CreateLanguageDocument } from "@/gql/generated/graphql";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
} from "@/components/ui";

interface CreateLanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: {
    id: string;
    created_at: string;
    iso2: string;
    name: string;
    native_name: string | null;
  }) => void;
}

export function CreateLanguageDialog({ open, onOpenChange, onCreated }: CreateLanguageDialogProps) {
  const [name, setName] = useState("");
  const [iso2, setIso2] = useState("");
  const [nativeName, setNativeName] = useState("");

  const [createLanguage, { loading: creating }] = useMutation(CreateLanguageDocument);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !iso2.trim()) return;
    try {
      const { data } = await createLanguage({
        variables: {
          language: {
            name: name.trim(),
            iso2: iso2.trim(),
            native_name: nativeName.trim() || null,
          },
        },
      });
      if (data?.createLanguage) {
        onCreated(data.createLanguage);
      }
      setName("");
      setIso2("");
      setNativeName("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to create language");
    }
  }, [name, iso2, nativeName, createLanguage, onCreated, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Create Language</DialogTitle>
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
              disabled={creating}
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
              disabled={creating}
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
              disabled={creating}
              className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-lg"
            />
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
            disabled={!name.trim() || !iso2.trim() || creating}
            onClick={handleCreate}
          >
            {creating ? "CREATING..." : "CREATE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
