"use client";

import { MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import { Pill } from "@/components/shared/pill";
import { Button } from "@/components/ui/button";
import { RowActions } from "@/components/shared/row-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function ProjectRow({
  project,
  columnCount,
  canMutate,
  isLast,
  onOpen,
  onUpdate,
  onRemove,
}: ProjectRowProps) {
  const tButtons = useTranslations("buttons");
  const tCommon = useTranslations("common");
  const pills = [...project.roles, ...project.responsibilities];
  const minPills = 4;
  const displayPills = pills.length >= minPills ? pills : pills;

  return (
    <tbody
      className={cn(
        "hover:bg-muted/50 dark:hover:bg-white/15",
        !isLast && "border-b border-b-table-border",
      )}
    >
      <tr className="cursor-pointer" onClick={() => onOpen(project)}>
        <td className="py-3 px-4 text-sm font-medium align-middle">{project.name}</td>
        <td className="py-3 px-4 text-sm font-medium hidden max-md:hidden md:table-cell align-middle">
          {project.domain}
        </td>
        <td className="py-3 px-4 text-sm font-medium hidden xl:table-cell align-middle">
          {formatDate(project.start_date)}
        </td>
        <td className="py-3 px-4 text-sm font-medium hidden xl:table-cell align-middle">
          {project.end_date ? formatDate(project.end_date) : tCommon("tillNow")}
        </td>
        <td className="py-3 px-4 w-12 align-middle">
          <RowActions canMutate={canMutate} onOpen={() => onOpen(project)}>
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
                  {tButtons("open")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdate(project)}
                  disabled={!canMutate}
                  className="justify-center cursor-pointer"
                >
                  {tButtons("update")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRemove(project)}
                  disabled={!canMutate}
                  variant="destructive"
                  className="justify-center cursor-pointer"
                >
                  {tButtons("remove")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </RowActions>
        </td>
      </tr>
      <tr className="cursor-pointer" onClick={() => onOpen(project)}>
        <td
          colSpan={columnCount}
          className="px-4 pb-2 pt-0 text-sm text-muted-foreground whitespace-normal wrap-break-word"
        >
          {project.description}
        </td>
      </tr>
      <tr className="cursor-pointer" onClick={() => onOpen(project)}>
        <td colSpan={columnCount} className="px-4 pb-3 pt-0">
          <div className="flex flex-wrap gap-2">
            {displayPills.map((pill, index) => (
              <Pill key={index} text={pill} variant="responsibility" />
            ))}
          </div>
        </td>
      </tr>
    </tbody>
  );
}
