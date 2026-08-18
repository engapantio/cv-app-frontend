"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  CvDocument,
  ProjectsDocument,
  AddCvProjectDocument,
  UpdateCvProjectDocument,
  RemoveCvProjectDocument,
  type CvQuery,
} from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import type { CvProjectItem } from "../types";

function extractProjects(cv: CvQuery["cv"] | null | undefined): CvProjectItem[] {
  if (!cv?.projects) return [];
  return cv.projects as CvProjectItem[];
}

export function useCvProjectsPage(
  cvId: string,
  initialCv?: CvQuery["cv"] | null,
  serverError?: string | null,
) {
  const t = useTranslations();
  const {
    data: cvData,
    loading: cvLoading,
    refetch: refetchCv,
  } = useQuery(CvDocument, {
    variables: { cvId },
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    // Skip the fetch when SSR already succeeded (serverError === null):
    // initialCv carries the data, so the client only needs to query when the
    // initial load failed and the page is retrying.
    skip: serverError == null,
  });

  const { data: projectsData } = useQuery(ProjectsDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const cv = useMemo(() => cvData?.cv ?? initialCv ?? null, [cvData, initialCv]);
  const { canEdit: canMutate } = usePermissions(cv?.user?.id);

  const [localProjects, setLocalProjects] = useState<CvProjectItem[]>(() => extractProjects(cv));

  const projects = useMemo(() => {
    // Prefer locally edited rows; fall back to the server/SSR list until the
    // first mutation provides an authoritative result.
    if (localProjects.length > 0) return localProjects;
    return extractProjects(cv);
  }, [cv, localProjects]);

  const allProjects = useMemo(() => {
    const addedIds = new Set(
      projects.map((p) => p.project?.id).filter((id): id is string => Boolean(id)),
    );
    return (projectsData?.projects ?? []).filter((p) => !addedIds.has(p.id));
  }, [projectsData, projects]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [openProject, setOpenProject] = useState<CvProjectItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<CvProjectItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CvProjectItem | null>(null);

  const [addCvProject, { loading: creating }] = useMutation(AddCvProjectDocument);
  const [updateCvProject, { loading: updating }] = useMutation(UpdateCvProjectDocument);
  const [removeCvProject, { loading: deleting }] = useMutation(RemoveCvProjectDocument);

  const handleCreate = useCallback(
    async (data: {
      projectId: string;
      start_date: string;
      end_date: string | null;
      roles: string[];
      responsibilities: string[];
    }) => {
      const result = await addCvProject({
        variables: {
          project: {
            cvId,
            projectId: data.projectId,
            start_date: data.start_date,
            end_date: data.end_date,
            roles: data.roles,
            responsibilities: data.responsibilities,
          },
        },
      });
      const updatedCv = result.data?.addCvProject;
      if (updatedCv?.projects) {
        const allProjects = updatedCv.projects as CvProjectItem[];
        const newProject = allProjects.find((p) => p.project.id === data.projectId);
        if (newProject) {
          setLocalProjects((prev) => [
            newProject,
            ...prev.filter((p) => p.project.id !== data.projectId),
          ]);
        } else {
          setLocalProjects(allProjects);
        }
        toast.success(t("common.cvsProjectAddedSuccess"));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
      // Keep the server list fresh for other views; a no-op while the query
      // is skipped, since the local state above already applied the change.
      refetchCv();
      setCreateOpen(false);
    },
    [addCvProject, cvId, refetchCv, t, setPagination],
  );

  const handleUpdate = useCallback(
    async (data: {
      projectId: string;
      start_date: string;
      end_date: string | null;
      roles: string[];
      responsibilities: string[];
    }) => {
      const result = await updateCvProject({
        variables: {
          project: {
            cvId,
            projectId: data.projectId,
            start_date: data.start_date,
            end_date: data.end_date,
            roles: data.roles,
            responsibilities: data.responsibilities,
          },
        },
      });
      const updatedCv = result.data?.updateCvProject;
      if (updatedCv?.projects) {
        setLocalProjects(updatedCv.projects as CvProjectItem[]);
        toast.success(t("common.cvsProjectUpdatedSuccess"));
      }
      refetchCv();
      setUpdateTarget(null);
    },
    [updateCvProject, cvId, refetchCv, t],
  );

  const handleDelete = useCallback(
    async (projectId: string) => {
      const result = await removeCvProject({
        variables: {
          project: { cvId, projectId },
        },
      });
      const updatedCv = result.data?.removeCvProject;
      if (updatedCv?.projects) {
        setLocalProjects(updatedCv.projects as CvProjectItem[]);
        toast.success(t("common.cvsProjectRemovedSuccess"));
      }
      refetchCv();
    },
    [removeCvProject, cvId, refetchCv, t],
  );

  return {
    loading: cvLoading,
    projects,
    allProjects,
    canMutate,
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
