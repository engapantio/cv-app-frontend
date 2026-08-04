"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { EnvPill } from "@/components/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
} from "@/components/ui";
import type { ProjectItem } from "../hooks/use-projects-page";

interface UpdateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectItem | null;
  allSkills: string[];
  onConfirm: (data: {
    projectId: string;
    name: string;
    domain: string;
    start_date: string;
    end_date: string | null;
    description: string;
    environment: string[];
  }) => Promise<void>;
  loading: boolean;
}

function UpdateProjectForm({
  project,
  allSkills,
  onConfirm,
  onOpenChange,
  loading,
}: {
  project: ProjectItem;
  allSkills: string[];
  onConfirm: UpdateProjectDialogProps["onConfirm"];
  onOpenChange: (open: boolean) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(project.name);
  const [domain, setDomain] = useState(project.domain);
  const [startDate, setStartDate] = useState<Date | undefined>(
    project.start_date ? new Date(project.start_date) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    project.end_date ? new Date(project.end_date) : undefined,
  );
  const [description, setDescription] = useState(project.description);
  const [selectedEnv, setSelectedEnv] = useState<string[]>([...project.environment]);
  const [envOpen, setEnvOpen] = useState(false);

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const toggleEnv = useCallback((skill: string) => {
    setSelectedEnv((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  }, []);

  const removeEnv = useCallback((skill: string) => {
    setSelectedEnv((prev) => prev.filter((s) => s !== skill));
  }, []);

  const isDirty =
    name !== project.name ||
    domain !== project.domain ||
    (startDate ? startDate.toISOString() : null) !==
      (project.start_date ? new Date(project.start_date).toISOString() : null) ||
    (endDate ? endDate.toISOString() : null) !==
      (project.end_date ? new Date(project.end_date).toISOString() : null) ||
    description !== project.description ||
    selectedEnv.length !== project.environment.length ||
    selectedEnv.some((env, i) => env !== project.environment[i]) ||
    project.environment.some((env) => !selectedEnv.includes(env));

  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm({
        projectId: project.id,
        name,
        domain,
        start_date: startDate ? startDate.toISOString() : project.start_date,
        end_date: endDate ? endDate.toISOString() : project.end_date,
        description,
        environment: selectedEnv,
      });
    } catch {
      toast.error("Failed to update project");
    }
  }, [
    project.id,
    name,
    domain,
    startDate,
    endDate,
    description,
    selectedEnv,
    onConfirm,
    project.start_date,
    project.end_date,
  ]);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-left text-base font-semibold">Update project</DialogTitle>
      </DialogHeader>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              Project
            </span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12"
            />
          </div>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
              Domain
            </span>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder=" "
              className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary z-10">
              Start Date
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
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary z-10">
              End Date
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
        <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
          <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
            Description
          </span>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder=" "
            className="peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none min-h-20 resize-none pt-6"
          />
        </div>
        <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
          <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary z-10">
            Environment
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
                  <p className="text-sm text-muted-foreground px-2 py-2">No skills available</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
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
          type="submit"
          className="uppercase text-white min-w-30 py-1.5 hover:brightness-90"
          style={{ backgroundColor: "#e53935" }}
          disabled={!isDirty || loading}
          onClick={handleConfirm}
        >
          {loading ? "UPDATING..." : "UPDATE"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function UpdateProjectDialog({
  open,
  onOpenChange,
  project,
  allSkills,
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
            allSkills={allSkills}
            onConfirm={onConfirm}
            onOpenChange={onOpenChange}
            loading={loading}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}
