"use client";

import { useProjectsPage } from "@/features/projects/hooks/use-projects-page";
import { ProjectsTable } from "@/features/projects/components/projects-table";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import { UpdateProjectDialog } from "@/features/projects/components/update-project-dialog";
import { OpenProjectOverlay } from "@/features/projects/components/open-project-overlay";
import { DeleteProjectDialog } from "@/features/projects/components/delete-project-dialog";

export default function ProjectsClient() {
  const {
    loading,
    projects,
    allSkills,
    canMutate,
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
  } = useProjectsPage();

  return (
    <>
      <ProjectsTable
        loading={loading}
        projects={projects}
        canMutate={canMutate}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onCreate={() => setCreateOpen(true)}
        onOpen={(p) => setOpenProject(p)}
        onUpdate={(p) => setUpdateTarget(p)}
        onDelete={(p) => setDeleteTarget(p)}
      />

      <OpenProjectOverlay
        open={!!openProject}
        onOpenChange={(open) => {
          if (!open) setOpenProject(null);
        }}
        project={openProject}
      />

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        allSkills={allSkills}
        onConfirm={handleCreate}
        loading={creating}
      />

      <UpdateProjectDialog
        open={!!updateTarget}
        onOpenChange={(open) => {
          if (!open) setUpdateTarget(null);
        }}
        project={updateTarget}
        allSkills={allSkills}
        onConfirm={handleUpdate}
        loading={updating}
      />

      <DeleteProjectDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
