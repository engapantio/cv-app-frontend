"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ProjectDocument, SkillsDocument, UpdateProjectDocument } from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import { Button, Input } from "@/components/ui";
import { Pill } from "@/components/shared/pill";
import { UpdateProjectDialog } from "@/features/projects/components/update-project-dialog";
import { toast } from "sonner";

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { isAdmin } = usePermissions();

  const { data, loading } = useQuery(ProjectDocument, {
    variables: { projectId },
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const { data: skillsData } = useQuery(SkillsDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const allSkills = skillsData?.skills?.map((s) => s.name) ?? [];
  const project = data?.project;

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateProject] = useMutation(UpdateProjectDocument);

  const handleUpdate = useCallback(
    async (input: {
      projectId: string;
      name: string;
      domain: string;
      start_date: string;
      end_date: string | null;
      description: string;
      environment: string[];
    }) => {
      try {
        await updateProject({ variables: { project: input } });
        setUpdateOpen(false);
        toast.success("Project updated");
      } catch {
        toast.error("Failed to update project");
      }
    },
    [updateProject],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive">Project not found</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center h-11 gap-2 mb-6">
        <Link
          href="/projects"
          className="text-base text-foreground/70 hover:text-primary transition-colors"
        >
          Projects
        </Link>
        <ChevronRight className="size-5" />
        <span style={{ color: "#c63031" }}>{project.name}</span>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
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

        {isAdmin && (
          <div className="flex justify-end">
            <Button
              className="uppercase text-white min-w-30 py-1.5 hover:brightness-90"
              style={{ backgroundColor: "#e53935" }}
              onClick={() => setUpdateOpen(true)}
            >
              UPDATE
            </Button>
          </div>
        )}
      </div>

      <UpdateProjectDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        project={project}
        allSkills={allSkills}
        onConfirm={handleUpdate}
        loading={false}
      />
    </div>
  );
}
