"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  CvDocument,
  ProjectsDocument,
  AddCvProjectDocument,
  UpdateCvProjectDocument,
  RemoveCvProjectDocument,
  type CvQuery,
} from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";

export interface CvProjectItem {
  id: string;
  name: string;
  internal_name: string;
  description: string;
  domain: string;
  start_date: string;
  end_date: string | null;
  environment: string[];
  roles: string[];
  responsibilities: string[];
  project: { id: string; name: string; internal_name: string };
}

function extractProjects(cv: CvQuery["cv"] | null | undefined): CvProjectItem[] {
  if (!cv?.projects) return [];
  return cv.projects as CvProjectItem[];
}

export function useCvProjectsPage(
  cvId: string,
  initialCv?: CvQuery["cv"] | null,
  serverError?: string | null,
) {
  const {
    data: cvData,
    loading: cvLoading,
    refetch: refetchCv,
  } = useQuery(CvDocument, {
    variables: { cvId },
    fetchPolicy: "network-only",
    errorPolicy: "all",
    skip: serverError == null,
  });

  const { data: projectsData } = useQuery(ProjectsDocument, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const cv = useMemo(() => cvData?.cv ?? initialCv ?? null, [cvData, initialCv]);
  const { canEdit: canMutate } = usePermissions(cv?.user?.id);

  const [localProjects, setLocalProjects] = useState<CvProjectItem[]>(() => extractProjects(cv));

  const projects = useMemo(() => {
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

  const [openProject, setOpenProject] = useState<CvProjectItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<CvProjectItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<CvProjectItem | null>(null);

  const [addCvProject, { loading: adding }] = useMutation(AddCvProjectDocument);
  const [updateCvProject, { loading: updating }] = useMutation(UpdateCvProjectDocument);
  const [removeCvProject, { loading: removing }] = useMutation(RemoveCvProjectDocument);

  const handleAdd = useCallback(
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
        setLocalProjects(updatedCv.projects as CvProjectItem[]);
      }
      refetchCv();
      setAddOpen(false);
    },
    [addCvProject, cvId, refetchCv],
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
      }
      refetchCv();
      setUpdateTarget(null);
    },
    [updateCvProject, cvId, refetchCv],
  );

  const handleRemove = useCallback(
    async (projectId: string) => {
      const result = await removeCvProject({
        variables: {
          project: { cvId, projectId },
        },
      });
      const updatedCv = result.data?.removeCvProject;
      if (updatedCv?.projects) {
        setLocalProjects(updatedCv.projects as CvProjectItem[]);
      }
      refetchCv();
    },
    [removeCvProject, cvId, refetchCv],
  );

  return {
    loading: cvLoading,
    projects,
    allProjects,
    canMutate,
    globalFilter,
    setGlobalFilter,
    openProject,
    setOpenProject,
    addOpen,
    setAddOpen,
    updateTarget,
    setUpdateTarget,
    removeTarget,
    setRemoveTarget,
    handleAdd,
    handleUpdate,
    handleRemove,
    adding,
    updating,
    removing,
  };
}
