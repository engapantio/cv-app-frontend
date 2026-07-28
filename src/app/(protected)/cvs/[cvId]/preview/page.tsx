import { createServerApolloClient } from "@/lib/apollo/server-client";
import { getServerAccessToken } from "@/lib/auth/cookies";
import {
  CvDocument,
  SkillCategoriesDocument,
  type CvQuery,
  type SkillCategoriesQuery,
} from "@/gql/generated/graphql";
import { CvPreviewClient } from "./cv-preview-client";

function computeSkillTableData(projects: CvQuery["cv"]["projects"]) {
  if (!projects || projects.length === 0) {
    return { years: 0.5, lastUsed: new Date().getFullYear() };
  }

  const validStarts: Date[] = [];
  const validEnds: Date[] = [];

  for (const p of projects) {
    if (p.start_date) {
      const d = new Date(p.start_date);
      if (!isNaN(d.getTime())) validStarts.push(d);
    }
    if (p.end_date) {
      const d = new Date(p.end_date);
      if (!isNaN(d.getTime())) validEnds.push(d);
    }
  }

  if (validStarts.length === 0) {
    return { years: 0.5, lastUsed: new Date().getFullYear() };
  }

  const earliestStart = new Date(Math.min(...validStarts.map((d) => d.getTime())));
  const years = Math.round(
    (Date.now() - earliestStart.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );

  let lastUsed: number | null = null;
  if (validEnds.length > 0) {
    const latestEnd = new Date(Math.max(...validEnds.map((d) => d.getTime())));
    lastUsed = latestEnd.getFullYear();
  } else {
    lastUsed = new Date().getFullYear();
  }

  return { years, lastUsed };
}

export default async function CvPreviewPage({
  params,
}: {
  params: Promise<{ cvId: string }>;
}) {
  const { cvId } = await params;

  let initialCv: CvQuery["cv"] | null = null;
  let skillCategories: SkillCategoriesQuery["skillCategories"] = [];
  let serverError: string | null = null;
  let years: number | null = null;
  let lastUsed: number | null = null;

  try {
    const token = await getServerAccessToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const client = createServerApolloClient(token);
    const [cvResult, categoriesResult] = await Promise.all([
      client.query({
        query: CvDocument,
        variables: { cvId },
        fetchPolicy: "no-cache",
      }),
      client.query({
        query: SkillCategoriesDocument,
        fetchPolicy: "no-cache",
      }),
    ]);

    initialCv = cvResult.data?.cv ?? null;
    skillCategories = categoriesResult.data?.skillCategories ?? [];

    if (!initialCv) {
      serverError = "CV not found";
    } else {
      const tableData = computeSkillTableData(initialCv.projects);
      years = tableData.years;
      lastUsed = tableData.lastUsed;
    }
  } catch (e) {
    serverError = e instanceof Error ? e.message : "Failed to load CV";
  }

  return (
    <CvPreviewClient
      initialCv={initialCv}
      skillCategories={skillCategories}
      serverError={serverError}
      years={years}
      lastUsed={lastUsed}
    />
  );
}
