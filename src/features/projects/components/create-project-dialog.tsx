"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { DialogActions, EnvPill, FloatingField } from "@/components/shared";
import { cn } from "@/lib/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
  Textarea,
} from "@/components/ui";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allSkills: string[];
  onConfirm: (data: {
    name: string;
    domain: string;
    start_date: string;
    end_date: string | null;
    description: string;
    environment: string[];
  }) => Promise<void>;
  loading: boolean;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  allSkills,
  onConfirm,
  loading,
}: CreateProjectDialogProps) {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [selectedEnv, setSelectedEnv] = useState<string[]>([]);
  const [envOpen, setEnvOpen] = useState(false);

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const reset = useCallback(() => {
    setName("");
    setDomain("");
    setStartDate(undefined);
    setEndDate(undefined);
    setDescription("");
    setSelectedEnv([]);
  }, []);

  const toggleEnv = useCallback((skill: string) => {
    setSelectedEnv((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  }, []);

  const removeEnv = useCallback((skill: string) => {
    setSelectedEnv((prev) => prev.filter((s) => s !== skill));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!name || !domain || !startDate || !description) {
      toast.error(t("common.fillRequiredFields"));
      return;
    }
    try {
      await onConfirm({
        name,
        domain,
        start_date: startDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null,
        description,
        environment: selectedEnv,
      });
      reset();
    } catch {
      toast.error(t("common.createProjectFailed"));
    }
  }, [name, domain, startDate, endDate, description, selectedEnv, onConfirm, reset, t]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent showCloseButton className="sm:max-w-xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.createProject")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FloatingField label={t("fields.project")}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12"
              />
            </FloatingField>
            <FloatingField label={t("fields.domain")}>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder=" "
                className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12"
              />
            </FloatingField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
              <span
                className={cn(
                  "absolute left-3 bg-background px-1 text-xs transition-all duration-200 pointer-events-none z-10",
                  startDate || startDateOpen
                    ? "-top-2.5 translate-y-0 text-xs text-muted-foreground dark:text-icon group-focus-within:text-primary"
                    : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
                )}
              >
                {t("fields.startDate")}
              </span>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="w-full border-0 bg-transparent shadow-none rounded-none h-12 justify-start text-left font-normal"
                    >
                      {startDate ? format(startDate, "dd/MM/yyyy") : ""}
                      <CalendarIcon className="ml-auto size-4 text-muted-foreground" />
                    </Button>
                  }
                />
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => {
                      setStartDate(d);
                      setStartDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
              <span
                className={cn(
                  "absolute left-3 bg-background px-1 text-xs transition-all duration-200 pointer-events-none z-10",
                  endDate || endDateOpen
                    ? "-top-2.5 translate-y-0 text-xs text-muted-foreground dark:text-icon group-focus-within:text-primary"
                    : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
                )}
              >
                {t("fields.endDate")}
              </span>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="w-full border-0 bg-transparent shadow-none rounded-none h-12 justify-start text-left font-normal"
                    >
                      {endDate ? format(endDate, "dd/MM/yyyy") : ""}
                      <CalendarIcon className="ml-auto size-4 text-muted-foreground" />
                    </Button>
                  }
                />
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(d) => {
                      setEndDate(d);
                      setEndDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <FloatingField label={t("fields.description")} variant="textarea">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=" "
              className="peer flex w-full bg-transparent px-4 pt-6 pb-3 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 border-0 min-h-25 resize-none"
            />
          </FloatingField>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span
              className={cn(
                "absolute left-3 bg-background px-1 text-xs transition-all duration-200 pointer-events-none z-10",
                selectedEnv.length > 0 || envOpen
                  ? "-top-2.5 translate-y-0 text-xs text-muted-foreground dark:text-icon group-focus-within:text-primary"
                  : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
              )}
            >
              {t("fields.environment")}
            </span>
            <Popover open={envOpen} onOpenChange={setEnvOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    className="w-full border-0 bg-transparent shadow-none rounded-none h-auto min-h-12 py-2.5 justify-start text-left font-normal items-start"
                  >
                    <div className="flex flex-wrap gap-1 flex-1">
                      {selectedEnv.map((skill) => (
                        <EnvPill key={skill} env={skill} onRemove={removeEnv} />
                      ))}
                    </div>
                    {envOpen ? (
                      <ChevronUp className="ml-auto size-4 text-muted-foreground shrink-0 mt-1.5" />
                    ) : (
                      <ChevronDown className="ml-auto size-4 text-muted-foreground shrink-0 mt-1.5" />
                    )}
                  </Button>
                }
              />
              <PopoverContent
                align="start"
                className="w-72 p-1 max-h-60 overflow-y-auto rounded-lg bg-popover text-sm shadow-md ring-1 ring-foreground/10"
              >
                <div className="space-y-0.5">
                  {allSkills.map((skill) => (
                    <label
                      key={skill}
                      className="relative flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEnv.includes(skill)}
                        onChange={() => toggleEnv(skill)}
                        className="size-4"
                      />
                      {skill}
                    </label>
                  ))}
                  {allSkills.length === 0 && (
                    <p className="text-sm text-muted-foreground px-2 py-2">
                      {t("common.noSkillsAvailable")}
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogActions
          submitLabel={t("buttons.create")}
          loadingLabel={t("buttons.creating")}
          loading={loading}
          disabled={!name || !domain || !startDate || !description}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleConfirm}
          submitClassName="hover:brightness-90"
        />
      </DialogContent>
    </Dialog>
  );
}
