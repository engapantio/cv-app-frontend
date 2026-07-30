import type { CvQuery } from "@/gql/generated/graphql";
import { formatDate } from "@/lib/utils/date";

type Project = NonNullable<NonNullable<CvQuery["cv"]>["projects"]>[number];

interface Props {
  project: Project;
  color?: string;
  primary?: string;
}

export function ProjectCard({ project, color, primary }: Props) {
  const fg = color ?? "var(--foreground)";
  const red = primary ?? "#c63031";

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-[1440px]:grid-cols-[260px_592px] gap-x-4 gap-y-2">
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

      <div className="md:border-l-2 pl-0 md:pl-8 pt-4 md:pt-0" style={{ borderColor: red }}>
        {project.roles && project.roles.length > 0 && (
          <div className="mb-3">
            <span className="text-base font-bold block" style={{ color: fg }}>
              Project roles
            </span>
            <p className="text-base" style={{ color: fg }}>
              {project.roles.join(", ")}
            </p>
          </div>
        )}

        <div className="mb-3">
          <span className="text-base font-bold block" style={{ color: fg }}>
            Period
          </span>
          <p className="text-base" style={{ color: fg }}>
            {project.start_date ? formatDate(project.start_date) : "—"} &ndash;{" "}
            {project.end_date ? formatDate(project.end_date) : "Till now"}
          </p>
        </div>

        {project.responsibilities && project.responsibilities.length > 0 && (
          <div className="mb-3">
            <span className="text-base font-bold block" style={{ color: fg }}>
              Responsibilities
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
              Environment
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
