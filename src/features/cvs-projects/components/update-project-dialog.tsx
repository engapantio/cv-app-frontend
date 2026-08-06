"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { DialogActions, EnvPill } from "@/components/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
} from "@/components/ui";
import type { CvProjectItem } from "../hooks/use-cv-projects-page";
import { parseRoles } from "../utils/roles-parser";

interface UpdateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: CvProjectItem | null;
  onConfirm: (data: {
    projectId: string;
    start_date: string;
    end_date: string | null;
    roles: string[];
    responsibilities: string[];
  }) => Promise<void>;
  loading: boolean;
}

function UpdateProjectForm({
  project,
  onConfirm,
  onOpenChange,
  loading,
}: {
  project: CvProjectItem;
  onConfirm: UpdateProjectDialogProps["onConfirm"];
  onOpenChange: (open: boolean) => void;
  loading: boolean;
}) {
  const t = useTranslations();
  const [startDate, setStartDate] = useState<Date | undefined>(
    project.start_date ? new Date(project.start_date) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    project.end_date ? new Date(project.end_date) : undefined,
  );
  const [rolesInput, setRolesInput] = useState(
    [...project.roles, ...project.responsibilities].join("\n"),
  );

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const isDirty =
    (startDate ? startDate.toISOString() : null) !==
      (project.start_date ? new Date(project.start_date).toISOString() : null) ||
    (endDate ? endDate.toISOString() : null) !==
      (project.end_date ? new Date(project.end_date).toISOString() : null) ||
    rolesInput !== [...project.roles, ...project.responsibilities].join("\n");

  const handleConfirm = useCallback(async () => {
    try {
      const { roles, responsibilities } = parseRoles(rolesInput);
      await onConfirm({
        projectId: project.project.id,
        start_date: startDate ? startDate.toISOString() : project.start_date,
        end_date: endDate ? endDate.toISOString() : project.end_date,
        roles,
        responsibilities,
      });
    } catch {
      toast.error(t("common.updateProjectFailed"));
    }
  }, [
    project.project.id,
    startDate,
    endDate,
    rolesInput,
    onConfirm,
    project.start_date,
    project.end_date,
    t,
  ]);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-left text-base font-semibold">
          {t("dialogs.updateProject")}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="group relative rounded-none border border-border">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)]">
              {t("fields.project")}
            </span>
            <Input
              value={project.project?.name ?? project.name}
              readOnly
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 opacity-60"
            />
          </div>
          <div className="group relative rounded-none border border-border">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)]">
              {t("fields.domain")}
            </span>
            <Input
              value={project.domain}
              readOnly
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 opacity-60"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)] transition-colors group-focus-within:text-primary z-10">
              {t("fields.startDate")}
            </span>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    className="w-full border-0 bg-transparent shadow-none rounded-none h-12 justify-start text-left font-normal"
                  >
                    {startDate ? format(startDate, "dd/MM/yyyy") : t("placeholders.selectDate")}
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
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)] transition-colors group-focus-within:text-primary z-10">
              {t("fields.endDate")}
            </span>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    className="w-full border-0 bg-transparent shadow-none rounded-none h-12 justify-start text-left font-normal"
                  >
                    {endDate ? format(endDate, "dd/MM/yyyy") : t("placeholders.selectDate")}
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
        <div className="group relative rounded-none border border-border">
          <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)]">
            {t("fields.description")}
          </span>
          <Textarea
            value={project.description}
            readOnly
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none min-h-25 resize-none opacity-60"
          />
        </div>
        <div className="group relative rounded-none border border-border">
          <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)]">
            {t("fields.environment")}
          </span>
          <div className="flex flex-wrap gap-2 px-4 py-3 min-h-12">
            {project.environment?.length ? (
              project.environment.map((env) => <EnvPill key={env} env={env} />)
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </div>
        <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
          <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.7)] transition-colors group-focus-within:text-primary z-10">
            {t("fields.rolesAndResponsibilities")}
          </span>
          <Textarea
            value={rolesInput}
            onChange={(e) => setRolesInput(e.target.value)}
            placeholder={t("placeholders.rolesAndResponsibilities")}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none min-h-25 resize-none pt-6 placeholder:text-muted-foreground dark:placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <DialogActions
        submitLabel={t("buttons.update")}
        loadingLabel={t("buttons.updating")}
        loading={loading}
        disabled={!isDirty}
        onCancel={() => onOpenChange(false)}
        onSubmit={handleConfirm}
        submitClassName="hover:brightness-90"
      />
    </>
  );
}

export function UpdateProjectDialog({
  open,
  onOpenChange,
  project,
  onConfirm,
  loading,
}: UpdateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {project && (
        <DialogContent
          key={project.id}
          showCloseButton
          className="sm:max-w-xl bg-card border-border rounded-none"
        >
          <UpdateProjectForm
            project={project}
            onConfirm={onConfirm}
            onOpenChange={onOpenChange}
            loading={loading}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}
