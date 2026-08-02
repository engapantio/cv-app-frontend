"use client";

import dynamic from "next/dynamic";
import { useProjectsPage, type ProjectItem } from "@/features/projects/hooks/use-projects-page";
import { ProjectsTable } from "@/features/projects/components/projects-table";
import { TablePageLayout } from "@/components/shared/table-page-layout";

const CreateProjectDialog = dynamic(
  () =>
    import("@/features/projects/components/create-project-dialog").then(
      (m) => m.CreateProjectDialog,
    ),
  { loading: () => null },
);
const UpdateProjectDialog = dynamic(
  () =>
    import("@/features/projects/components/update-project-dialog").then(
      (m) => m.UpdateProjectDialog,
    ),
  { loading: () => null },
);
const OpenProjectOverlay = dynamic(
  () =>
    import("@/features/projects/components/open-project-overlay").then((m) => m.OpenProjectOverlay),
  { loading: () => null },
);
const DeleteProjectDialog = dynamic(
  () =>
    import("@/features/projects/components/delete-project-dialog").then(
      (m) => m.DeleteProjectDialog,
    ),
  { loading: () => null },
);

export default function ProjectsClient({
  initialProjects,
  serverError,
}: {
  initialProjects: ProjectItem[];
  serverError?: string | null;
}) {
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
  } = useProjectsPage(initialProjects);

  return (
    <TablePageLayout title="Projects">
      <ProjectsTable
        loading={loading}
        projects={projects}
        canMutate={canMutate}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        serverError={serverError}
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
          allSkills={allSkills}
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
          allSkills={allSkills}
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
    </TablePageLayout>
  );
}
