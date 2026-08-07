import type { CvQuery } from "@/gql/generated/graphql";
import { formatDate } from "@/lib/utils/date";

type Project = NonNullable<NonNullable<CvQuery["cv"]>["projects"]>[number];

interface Props {
  project: Project;
  color?: string;
  primary?: string;
  labels?: {
    projectRoles?: string;
    period?: string;
    tillNow?: string;
    responsibilities?: string;
    environment?: string;
  };
}

export function ProjectCard({ project, color, primary, labels }: Props) {
  const fg = color ?? "var(--foreground)";
  const red = primary ?? "#c63031";
  const l = labels ?? {};

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "284px 1fr",
        gap: "0 1rem",
      }}
    >
      <div>
        <p className="text-base font-bold" style={{ color: red }}>
          {project.name.toUpperCase()}
        </p>
        {project.description && (
          <p className="text-base mt-2" style={{ color: fg }}>
            {project.description}
          </p>
        )}
      </div>

      <div style={{ borderLeft: `2px solid ${red}`, paddingLeft: "2rem" }}>
        {project.roles && project.roles.length > 0 && (
          <div className="mb-3">
            <span className="text-base font-bold block" style={{ color: fg }}>
              {l.projectRoles ?? "Project roles"}
            </span>
            <p className="text-base" style={{ color: fg }}>
              {project.roles.join(", ")}
            </p>
          </div>
        )}

        <div className="mb-3">
          <span className="text-base font-bold block" style={{ color: fg }}>
            {l.period ?? "Period"}
          </span>
          <p className="text-base" style={{ color: fg }}>
            {project.start_date ? formatDate(project.start_date) : "—"} &ndash;{" "}
            {project.end_date ? formatDate(project.end_date) : (l.tillNow ?? "Till now")}
          </p>
        </div>

        {project.responsibilities && project.responsibilities.length > 0 && (
          <div className="mb-3">
            <span className="text-base font-bold block" style={{ color: fg }}>
              {l.responsibilities ?? "Responsibilities"}
            </span>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              {project.responsibilities.map((resp, i) => (
                <li key={i} className="text-base" style={{ color: fg }}>
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {project.environment && project.environment.length > 0 && (
          <div className="mb-3">
            <span className="text-base font-bold block" style={{ color: fg }}>
              {l.environment ?? "Environment"}
            </span>
            <p className="text-base" style={{ color: fg }}>
              {project.environment.join(", ")}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
