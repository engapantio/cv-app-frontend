"use client";

import dynamic from "next/dynamic";
import { useCvProjectsPage } from "@/features/cvs-projects/hooks/use-cv-projects-page";
import { ProjectsTable } from "@/features/cvs-projects/components/projects-table";
import type { CvQuery } from "@/gql/generated/graphql";

const CreateProjectDialog = dynamic(
  () =>
    import("@/features/cvs-projects/components/create-project-dialog").then(
      (m) => m.CreateProjectDialog,
    ),
  { loading: () => null },
);
const UpdateProjectDialog = dynamic(
  () =>
    import("@/features/cvs-projects/components/update-project-dialog").then(
      (m) => m.UpdateProjectDialog,
    ),
  { loading: () => null },
);
const OpenProjectOverlay = dynamic(
  () =>
    import("@/features/cvs-projects/components/open-project-overlay").then(
      (m) => m.OpenProjectOverlay,
    ),
  { loading: () => null },
);
const DeleteProjectDialog = dynamic(
  () =>
    import("@/features/cvs-projects/components/delete-project-dialog").then(
      (m) => m.DeleteProjectDialog,
    ),
  { loading: () => null },
);

type CvData = CvQuery["cv"];

export default function CvProjectsClient({
  cvId,
  initialCv,
  serverError,
}: {
  cvId: string;
  initialCv: CvData | null;
  serverError: string | null;
}) {
  const {
    loading,
    projects,
    allProjects,
    canMutate,
    globalFilter,
    setGlobalFilter,
    pagination,
    onPaginationChange,
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
  } = useCvProjectsPage(cvId, initialCv, serverError);

  if (serverError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive">{serverError}</p>
      </div>
    );
  }

  return (
    <>
      <ProjectsTable
        loading={loading}
        projects={projects}
        canMutate={canMutate}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onCreate={() => setCreateOpen(true)}
        onOpen={(p) => setOpenProject(p)}
        onUpdate={(p) => setUpdateTarget(p)}
        onDelete={(p) => setDeleteTarget(p)}
      />

      {openProject && (
        <OpenProjectOverlay
          open={!!openProject}
          onOpenChange={(open) => {
            if (!open) setOpenProject(null);
          }}
          project={openProject}
        />
      )}

      {createOpen && (
        <CreateProjectDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          allProjects={allProjects}
          onConfirm={handleCreate}
          loading={creating}
        />
      )}

      {updateTarget && (
        <UpdateProjectDialog
          open={!!updateTarget}
          onOpenChange={(open) => {
            if (!open) setUpdateTarget(null);
          }}
          project={updateTarget}
          onConfirm={handleUpdate}
          loading={updating}
        />
      )}

      {deleteTarget && (
        <DeleteProjectDialog
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </>
  );
}
