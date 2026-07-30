"use client";

import { format } from "date-fns";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import type { CvProjectItem } from "../hooks/use-cv-projects-page";

interface ProjectRowProps {
  project: CvProjectItem;
  columnCount: number;
  canMutate: boolean;
  isLast: boolean;
  onOpen: (project: CvProjectItem) => void;
  onUpdate: (project: CvProjectItem) => void;
  onRemove: (project: CvProjectItem) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "dd/MM/yyyy");
  } catch {
    return "—";
  }
}

function Pill({ text }: { text: string }) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground truncate max-w-[25%] min-w-0 select-none"
      style={{ maxWidth: "25%" }}
      title={text}
    >
      {text}
    </span>
  );
}

export function ProjectRow({
  project,
  columnCount,
  canMutate,
  isLast,
  onOpen,
  onUpdate,
  onRemove,
}: ProjectRowProps) {
  const pills = [...project.roles, ...project.responsibilities];
  const minPills = 4;
  const displayPills = pills.length >= minPills ? pills : pills;

  return (
    <tbody className={cn("group", !isLast && "border-b border-border")}>
      <tr
        className="cursor-pointer group-hover:bg-muted/50 dark:group-hover:bg-white/15"
        onClick={() => onOpen(project)}
      >
        <td className="py-3 px-4 text-sm font-medium align-middle">{project.name}</td>
        <td className="py-3 px-4 text-sm font-medium hidden max-md:hidden md:table-cell align-middle">
          {project.domain}
        </td>
        <td className="py-3 px-4 text-sm font-medium hidden xl:table-cell align-middle">
          {formatDate(project.start_date)}
        </td>
        <td className="py-3 px-4 text-sm font-medium hidden xl:table-cell align-middle">
          {project.end_date ? formatDate(project.end_date) : "Till now"}
        </td>
        <td className="py-3 px-4 w-12 align-middle">
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="rounded-[20px] cursor-pointer">
                    <MoreVertical className="size-6" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-32">
                <DropdownMenuItem
                  onClick={() => onOpen(project)}
                  className="justify-center cursor-pointer"
                >
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdate(project)}
                  disabled={!canMutate}
                  className="justify-center cursor-pointer"
                >
                  Update
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRemove(project)}
                  disabled={!canMutate}
                  variant="destructive"
                  className="justify-center cursor-pointer"
                >
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
      <tr
        className="cursor-pointer group-hover:bg-muted/50 dark:group-hover:bg-white/15"
        onClick={() => onOpen(project)}
      >
        <td
          colSpan={columnCount}
          className="px-4 pb-2 pt-0 text-sm text-muted-foreground whitespace-normal break-words"
        >
          {project.description}
        </td>
      </tr>
      <tr
        className="cursor-pointer group-hover:bg-muted/50 dark:group-hover:bg-white/15"
        onClick={() => onOpen(project)}
      >
        <td colSpan={columnCount} className="px-4 pb-3 pt-0">
          <div className="flex flex-wrap gap-2">
            {displayPills.map((pill, index) => (
              <Pill key={index} text={pill} />
            ))}
          </div>
        </td>
      </tr>
    </tbody>
  );
}
