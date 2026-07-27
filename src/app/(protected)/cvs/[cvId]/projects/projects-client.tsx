"use client";

import { useCvProjectsPage } from "@/features/cvs-projects/hooks/use-cv-projects-page";
import { ProjectsTable } from "@/features/cvs-projects/components/projects-table";
import { AddProjectDialog } from "@/features/cvs-projects/components/add-project-dialog";
import { UpdateProjectDialog } from "@/features/cvs-projects/components/update-project-dialog";
import { OpenProjectOverlay } from "@/features/cvs-projects/components/open-project-overlay";
import { RemoveProjectDialog } from "@/features/cvs-projects/components/remove-project-dialog";
import type { CvQuery } from "@/gql/generated/graphql";

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
  } = useCvProjectsPage(cvId, initialCv);

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
        onAdd={() => setAddOpen(true)}
        onOpen={(p) => setOpenProject(p)}
        onUpdate={(p) => setUpdateTarget(p)}
        onRemove={(p) => setRemoveTarget(p)}
      />

      <OpenProjectOverlay
        open={!!openProject}
        onOpenChange={(open) => {
          if (!open) setOpenProject(null);
        }}
        project={openProject}
      />

      <AddProjectDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        allProjects={allProjects}
        onConfirm={handleAdd}
        loading={adding}
      />

      <UpdateProjectDialog
        open={!!updateTarget}
        onOpenChange={(open) => {
          if (!open) setUpdateTarget(null);
        }}
        project={updateTarget}
        onConfirm={handleUpdate}
        loading={updating}
      />

      <RemoveProjectDialog
        target={removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        loading={removing}
      />
    </>
  );
}
