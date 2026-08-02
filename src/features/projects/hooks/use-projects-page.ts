"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  ProjectsDocument,
  SkillsDocument,
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
  type ProjectsQuery,
} from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";

export type ProjectItem = ProjectsQuery["projects"][number];

export function useProjectsPage(initialProjects: ProjectItem[]) {
  const { data, loading, refetch } = useQuery(ProjectsDocument, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const { data: skillsData } = useQuery(SkillsDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const { isAdmin } = usePermissions();

  const allSkills = useMemo(() => skillsData?.skills?.map((s) => s.name) ?? [], [skillsData]);

  const [localProjects, setLocalProjects] = useState<ProjectItem[]>([]);

  const projects = useMemo(() => {
    const serverProjects = data?.projects ?? initialProjects;
    const merged = new Map<string, ProjectItem>(serverProjects.map((p) => [p.id, p]));
    for (const p of localProjects) {
      merged.set(p.id, p);
    }
    return [...merged.values()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [data, localProjects, initialProjects]);

  const [globalFilter, setGlobalFilter] = useState("");

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
      }
      refetch();
      setCreateOpen(false);
    },
    [createProject, refetch],
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
      }
      refetch();
      setUpdateTarget(null);
    },
    [updateProject, refetch],
  );

  const handleDelete = useCallback(
    async (projectId: string) => {
      await deleteProject({
        variables: { project: { projectId } },
      });
      setLocalProjects((prev) => prev.filter((p) => p.id !== projectId));
      refetch();
    },
    [deleteProject, refetch],
  );

  return {
    loading: loading && projects.length === 0,
    projects,
    allSkills,
    canMutate: isAdmin,
    globalFilter,
    setGlobalFilter,
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
