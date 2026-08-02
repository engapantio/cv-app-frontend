import { fetchInitialRows } from "@/lib/apollo/initial-data";
import { ProjectsDocument, type ProjectsQuery } from "@/gql/generated/graphql";
import ProjectsClient from "./projects-client";

type ProjectItem = ProjectsQuery["projects"][number];

export default async function ProjectsPage() {
  const { initial, serverError } = await fetchInitialRows<ProjectsQuery, ProjectItem>({
    query: ProjectsDocument,
    getData: (data) => (data?.projects ?? []) as ProjectItem[],
    sort: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    errorMessage: "Failed to load projects",
  });

  return <ProjectsClient initialProjects={initial} serverError={serverError} />;
}
