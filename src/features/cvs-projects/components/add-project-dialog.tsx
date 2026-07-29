"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
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
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [rolesInput, setRolesInput] = useState("");

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
      toast.error("Failed to add project");
    }
  }, [selectedProject, startDate, endDate, rolesInput, onConfirm, reset]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) reset();
        onOpenChange(open);
      }}
    >
      <DialogContent showCloseButton className="sm:max-w-xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">Add project</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary">
                Project
              </span>
              <Select value={selectedProject?.name ?? ""} onValueChange={handleProjectSelect}>
                <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-sm data-[size=default]:h-12">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {allProjects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.name} className="text-sm">
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="group relative rounded-none border border-border">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
                Domain
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
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Select date"}
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
                      {endDate ? format(endDate, "dd/MM/yyyy") : "Select date"}
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
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
              Description
            </span>
            <Textarea
              value={selectedProject?.description ?? ""}
              readOnly
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none min-h-[80px] resize-none"
            />
          </div>
          <div className="group relative rounded-none border border-border">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
              Environment
            </span>
            <div className="flex flex-wrap gap-2 px-4 py-3 min-h-12">
              {selectedProject?.environment?.length ? (
                selectedProject.environment.map((env) => (
                  <span
                    key={env}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground"
                  >
                    {env}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <div className="group relative rounded-none border border-border transition-colors focus-within:border-primary">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-foreground transition-colors group-focus-within:text-primary z-10">
              Roles and responsibilities
            </span>
            <Textarea
              value={rolesInput}
              onChange={(e) => setRolesInput(e.target.value)}
              placeholder="Enter roles and responsibilities (one per line)"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none min-h-[100px] resize-none pt-6"
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
            type="submit"
            className="uppercase text-white min-w-30 py-1.5 hover:brightness-90"
            style={{ backgroundColor: "#e53935" }}
            disabled={!selectedProject || loading}
            onClick={handleConfirm}
          >
            {loading ? "ADDING..." : "ADD"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
