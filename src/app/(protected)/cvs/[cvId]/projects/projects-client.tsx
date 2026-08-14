"use client";

import dynamic from "next/dynamic";
import { useCvProjectsPage } from "@/features/cvs-projects/hooks/use-cv-projects-page";
import { ProjectsTable } from "@/features/cvs-projects/components/projects-table";
import type { CvQuery } from "@/gql/generated/graphql";

const AddProjectDialog = dynamic(
  () =>
    import("@/features/cvs-projects/components/add-project-dialog").then((m) => m.AddProjectDialog),
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
const RemoveProjectDialog = dynamic(
  () =>
    import("@/features/cvs-projects/components/remove-project-dialog").then(
      (m) => m.RemoveProjectDialog,
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
        onAdd={() => setAddOpen(true)}
        onOpen={(p) => setOpenProject(p)}
        onUpdate={(p) => setUpdateTarget(p)}
        onRemove={(p) => setRemoveTarget(p)}
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

      {addOpen && (
        <AddProjectDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          allProjects={allProjects}
          onConfirm={handleAdd}
          loading={adding}
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

      {removeTarget && (
        <RemoveProjectDialog
          target={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onConfirm={handleRemove}
          loading={removing}
        />
      )}
    </>
  );
}
