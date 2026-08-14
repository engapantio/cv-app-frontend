"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  ProjectsDocument,
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
  type ProjectsQuery,
} from "@/gql/generated/graphql";

export type ProjectItem = ProjectsQuery["projects"][number];

export function useProjectsPage(initialProjects: ProjectItem[]) {
  const t = useTranslations();
  const { data, loading } = useQuery(ProjectsDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const [localProjects, setLocalProjects] = useState<ProjectItem[]>([]);

  const projects = useMemo(() => {
    const serverProjects = data?.projects ?? initialProjects;
    const merged = new Map<string, ProjectItem>();
    for (const p of localProjects) {
      merged.set(p.id, p);
    }
    for (const p of serverProjects) {
      if (!merged.has(p.id)) {
        merged.set(p.id, p);
      }
    }
    return [...merged.values()];
  }, [data, localProjects, initialProjects]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [openProject, setOpenProject] = useState<ProjectItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<ProjectItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);

  const [createProject, { loading: creating }] = useMutation(CreateProjectDocument);
  const [updateProject, { loading: updating }] = useMutation(UpdateProjectDocument);
  const [deleteProject, { loading: deleting }] = useMutation(DeleteProjectDocument);

  const handleCreate = useCallback(
    async (input: {
      name: string;
      domain: string;
      start_date: string;
      end_date: string | null;
      description: string;
      environment: string[];
    }) => {
      const result = await createProject({
        variables: { project: input },
      });
      const created = result.data?.createProject;
      if (created) {
        setLocalProjects((prev) => [created as ProjectItem, ...prev]);
        toast.success(t("common.projectCreatedSuccess"));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
      setCreateOpen(false);
    },
    [createProject, t, setPagination],
  );

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
      const result = await updateProject({
        variables: { project: input },
      });
      const updated = result.data?.updateProject;
      if (updated) {
        setLocalProjects((prev) =>
          prev.map((p) => (p.id === updated.id ? (updated as ProjectItem) : p)),
        );
        toast.success(t("common.projectUpdatedSuccess"));
      }
      setUpdateTarget(null);
    },
    [updateProject, t],
  );

  const handleDelete = useCallback(
    async (projectId: string) => {
      await deleteProject({
        variables: { project: { projectId } },
      });
      setLocalProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success(t("common.projectDeletedSuccess"));
    },
    [deleteProject, t],
  );

  return {
    loading: loading && projects.length === 0,
    projects,
    globalFilter,
    setGlobalFilter,
    pagination,
    onPaginationChange: setPagination,
    openProject,
    setOpenProject,
    createOpen,
    setCreateOpen,
    updateTarget,
    setUpdateTarget,
    deleteTarget,
    setDeleteTarget,
    handleCreate,
    handleUpdate,
    handleDelete,
    creating,
    updating,
    deleting,
  };
}
