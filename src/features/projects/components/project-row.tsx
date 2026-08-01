"use client";

import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import { Pill } from "@/components/shared/pill";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectItem } from "../hooks/use-projects-page";

interface ProjectRowProps {
  project: ProjectItem;
  columnCount: number;
  canMutate: boolean;
  isLast: boolean;
  onOpen: (project: ProjectItem) => void;
  onUpdate: (project: ProjectItem) => void;
  onDelete: (project: ProjectItem) => void;
}

export function ProjectRow({
  project,
  columnCount,
  canMutate,
  isLast,
  onOpen,
  onUpdate,
  onDelete,
}: ProjectRowProps) {
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
          {formatDate(project.end_date, "Till now")}
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
                  onClick={() => onDelete(project)}
                  disabled={!canMutate}
                  variant="destructive"
                  className="justify-center cursor-pointer"
                >
                  Delete
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
          className="px-4 pb-2 pt-0 text-sm text-muted-foreground whitespace-normal wrap-break-word"
        >
          {project.description}
        </td>
      </tr>
      <tr
        className="cursor-pointer group-hover:bg-muted/50 dark:group-hover:bg-white/15"
        onClick={() => onOpen(project)}
      >
        <td colSpan={columnCount} className="px-4 pb-3 pt-0">
          <div className="flex flex-wrap gap-1">
            {project.environment.map((env, index) => (
              <Pill key={index} text={env} variant="transparent" />
            ))}
          </div>
        </td>
      </tr>
    </tbody>
  );
}
