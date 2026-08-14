"use client";

import { MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import { usePermissions } from "@/lib/auth/permissions";
import { Pill } from "@/components/shared/pill";
import { Button } from "@/components/ui/button";
import { RowActions } from "@/components/shared/row-actions";
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
  isLast: boolean;
  onOpen: (project: ProjectItem) => void;
  onUpdate: (project: ProjectItem) => void;
  onDelete: (project: ProjectItem) => void;
}

export function ProjectRow({
  project,
  columnCount,
  isLast,
  onOpen,
  onUpdate,
  onDelete,
}: ProjectRowProps) {
  const tButtons = useTranslations("buttons");
  const tCommon = useTranslations("common");
  const { isAdmin } = usePermissions();
  const canMutate = isAdmin;

  return (
    <tbody
      className={cn(
        "group",
        "hover:bg-row-hover dark:hover:bg-white/15",
        !isLast && "border-b border-b-table-border",
      )}
    >
      <tr className="cursor-pointer" onClick={() => onOpen(project)}>
        <td className="py-3 px-4 text-sm font-normal align-middle min-[1440px]:tracking-[0.01em] min-[1440px]:leading-[143%]">
          {project.name}
        </td>
        <td className="py-3 px-4 text-sm font-normal hidden max-md:hidden md:table-cell align-middle min-[1440px]:tracking-[0.01em] min-[1440px]:leading-[143%]">
          {project.domain}
        </td>
        <td className="py-3 px-4 text-sm font-normal hidden xl:table-cell align-middle min-[1440px]:tracking-[0.01em] min-[1440px]:leading-[143%]">
          {formatDate(project.start_date)}
        </td>
        <td className="py-3 px-4 text-sm font-normal hidden xl:table-cell align-middle min-[1440px]:tracking-[0.01em] min-[1440px]:leading-[143%]">
          {formatDate(project.end_date, tCommon("tillNow"))}
        </td>
        <td className="py-3 px-4 w-12 align-middle min-[1440px]:tracking-[0.01em] min-[1440px]:leading-[143%]">
          <RowActions canMutate={canMutate} onOpen={() => onOpen(project)}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="rounded-[20px] cursor-pointer">
                    <MoreVertical className="size-6 text-muted-solid dark:text-white" />
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
                  onClick={() => onDelete(project)}
                  disabled={!canMutate}
                  variant="destructive"
                  className="justify-center cursor-pointer"
                >
                  {tButtons("delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </RowActions>
        </td>
      </tr>
      <tr className="cursor-pointer" onClick={() => onOpen(project)}>
        <td
          colSpan={columnCount}
          className="px-4 pb-4 pt-0 text-sm font-normal text-description leading-[143%] tracking-[0.01em] whitespace-normal wrap-break-word"
        >
          {project.description}
        </td>
      </tr>
      <tr className="cursor-pointer" onClick={() => onOpen(project)}>
        <td
          colSpan={columnCount}
          className="px-4 pb-4 pt-0 min-[1440px]:tracking-[0.01em] min-[1440px]:leading-[143%]"
        >
          <div className="flex flex-wrap gap-1">
            {project.environment.map((env, index) => (
              <Pill
                key={index}
                text={env}
                variant="transparent"
                className="group-hover:border-background transition-colors"
              />
            ))}
          </div>
        </td>
      </tr>
    </tbody>
  );
}
