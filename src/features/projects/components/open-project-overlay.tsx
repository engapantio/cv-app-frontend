"use client";

import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@/components/ui";
import { Pill } from "@/components/shared/pill";
import type { ProjectItem } from "../hooks/use-projects-page";

interface OpenProjectOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectItem | null;
}

export function OpenProjectOverlay({ open, onOpenChange, project }: OpenProjectOverlayProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-lg bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">{project.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="group relative rounded-none border border-border">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
                Project
              </span>
              <Input
                value={project.name}
                readOnly
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12"
              />
            </div>
            <div className="group relative rounded-none border border-border">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
                Internal name
              </span>
              <Input
                value={project.internal_name}
                readOnly
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="group relative rounded-none border border-border">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
                Domain
              </span>
              <Input
                value={project.domain}
                readOnly
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12"
              />
            </div>
            <div className="group relative rounded-none border border-border">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
                Start Date
              </span>
              <Input
                value={format(new Date(project.start_date), "dd/MM/yyyy")}
                readOnly
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12"
              />
            </div>
            <div className="group relative rounded-none border border-border">
              <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
                End Date
              </span>
              <Input
                value={
                  project.end_date ? format(new Date(project.end_date), "dd/MM/yyyy") : "Till now"
                }
                readOnly
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12"
              />
            </div>
          </div>
          <div className="group relative rounded-none border border-border">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
              Description
            </span>
            <textarea
              value={project.description}
              readOnly
              className="flex w-full bg-card px-4 pt-6 pb-3 text-sm focus-visible:outline-none border-0 min-h-25 resize-none"
            />
          </div>
          <div className="group relative rounded-none border border-border">
            <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
              Environment
            </span>
            <div className="flex flex-wrap gap-2 px-4 py-3 min-h-12">
              {project.environment.map((env) => (
                <Pill key={env} text={env} variant="transparent" />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
