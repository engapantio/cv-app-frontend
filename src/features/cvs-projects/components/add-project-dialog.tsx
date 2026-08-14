"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { parseRoles } from "../utils/roles-parser";

interface ProjectOption {
  id: string;
  name: string;
  internal_name: string;
  domain: string;
  start_date: string;
  end_date: string | null;
  description: string;
  environment: string[];
}

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allProjects: ProjectOption[];
  onConfirm: (data: {
    projectId: string;
    start_date: string;
    end_date: string | null;
    roles: string[];
    responsibilities: string[];
  }) => Promise<void>;
  loading: boolean;
}

export function AddProjectDialog({
  open,
  onOpenChange,
  allProjects,
  onConfirm,
  loading,
}: AddProjectDialogProps) {
  const t = useTranslations();
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [rolesInput, setRolesInput] = useState("");
  const [projectOpen, setProjectOpen] = useState(false);

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const reset = useCallback(() => {
    setSelectedProject(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setRolesInput("");
  }, []);

  const handleProjectSelect = useCallback(
    (value: string | null) => {
      if (!value) {
        setSelectedProject(null);
        setStartDate(undefined);
        setEndDate(undefined);
        return;
      }
      const project = allProjects.find((p) => p.name === value);
      if (!project) return;
      setSelectedProject(project);
      setStartDate(project.start_date ? new Date(project.start_date) : undefined);
      setEndDate(project.end_date ? new Date(project.end_date) : undefined);
    },
    [allProjects],
  );

  const handleConfirm = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const { roles, responsibilities } = parseRoles(rolesInput);
      await onConfirm({
        projectId: selectedProject.id,
        start_date: startDate ? startDate.toISOString() : "",
        end_date: endDate ? endDate.toISOString() : null,
        roles,
        responsibilities,
      });
      reset();
    } catch {
      toast.error(t("common.addProjectFailed"));
    }
  }, [selectedProject, startDate, endDate, rolesInput, onConfirm, reset, t]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) reset();
        onOpenChange(open);
      }}
    >
      <DialogContent showCloseButton className="sm:max-w-4xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-semibold">
            {t("dialogs.addProject")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pb-1">
          <div className="grid grid-cols-2 gap-4">
            <FloatingField
              label={t("fields.project")}
              variant="select"
              active={!!selectedProject || projectOpen}
            >
              <Select
                value={selectedProject?.name ?? ""}
                onValueChange={handleProjectSelect}
                onOpenChange={setProjectOpen}
              >
                <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-sm data-[size=default]:h-12">
                  <SelectValue placeholder={t("placeholders.selectProject")} />
                </SelectTrigger>
                <SelectContent>
                  {allProjects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.name} className="text-sm">
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FloatingField>
            <div className="group relative rounded-none border border-border">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon">
                {t("fields.domain")}
              </span>
              <Input
                value={selectedProject?.domain ?? ""}
                readOnly
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12"
              />
            </div>
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
          <div className="group relative rounded-none border border-border">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon">
              {t("fields.description")}
            </span>
            <Textarea
              value={selectedProject?.description ?? ""}
              readOnly
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none min-h-25 resize-none"
            />
          </div>
          <div className="group relative rounded-none border border-border">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon">
              {t("fields.environment")}
            </span>
            <div className="flex flex-wrap gap-2 px-4 py-3 min-h-12">
              {selectedProject?.environment?.length ? (
                selectedProject.environment.map((env) => <EnvPill key={env} env={env} />)
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground dark:text-icon transition-colors group-focus-within:text-primary z-10">
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
          submitLabel={t("buttons.add")}
          loadingLabel={t("buttons.adding")}
          loading={loading}
          disabled={!selectedProject}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleConfirm}
          submitClassName="hover:brightness-90"
        />
      </DialogContent>
    </Dialog>
  );
}
