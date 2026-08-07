import { Fragment } from "react";
import type { CvQuery } from "@/gql/generated/graphql";

type CvData = CvQuery["cv"];

interface Props {
  skillsByCategory: Map<string, NonNullable<CvData["skills"]>>;
  categoryMap: Map<string, string>;
  years: number | null;
  lastUsed: number | null;
  color?: string;
  primary?: string;
  muted?: string;
  labels?: {
    skills?: string;
    experience?: string;
    inYears?: string;
    lastUsed?: string;
  };
}

export function SkillsTable({
  skillsByCategory,
  categoryMap,
  years,
  lastUsed,
  color,
  primary,
  muted,
  labels,
}: Props) {
  const fg = color ?? "var(--foreground)";
  const red = primary ?? "#c63031";
  const borderColor = muted ?? "#bdbdbd";
  const l = labels ?? {};

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "22%" }} />
          <col style={{ width: "48%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead>
          <tr>
            <th
              className="text-left font-medium text-sm py-3 px-3 align-top"
              style={{ color: fg, borderBottom: `1px solid ${red}` }}
            >
              {l.skills ?? "SKILLS"}
            </th>
            <th
              className="text-left font-medium text-sm py-3 px-3"
              style={{ color: fg, borderBottom: `1px solid ${red}` }}
            />
            <th
              className="text-center font-medium text-sm py-3 px-3 leading-tight"
              style={{ color: fg, borderBottom: `1px solid ${red}`, verticalAlign: "middle" }}
            >
              <span className="block">{l.experience ?? "EXPERIENCE"}</span>
              <span className="block">{l.inYears ?? "IN YEARS"}</span>
            </th>
            <th
              className="text-center font-medium text-sm py-3 px-3 align-top"
              style={{ color: fg, borderBottom: `1px solid ${red}` }}
            >
              {l.lastUsed ?? "LAST USED"}
            </th>
          </tr>
        </thead>
        <tbody>
          {[...skillsByCategory.entries()].map(([catId, skills]) => {
            const catName = categoryMap.get(catId) ?? catId;
            return (
              <tr key={catId}>
                <td
                  className="py-3 px-3 text-sm font-bold align-top"
                  style={{ color: red, borderBottom: `1px solid ${borderColor}` }}
                >
                  {catName}
                </td>
                <td
                  className="py-3 px-3 text-sm font-bold align-top"
                  style={{ color: fg, borderBottom: `1px solid ${borderColor}` }}
                >
                  {skills.map((s, i) => (
                    <Fragment key={s.name}>
                      {i > 0 && <br />}
                      {s.name}
                    </Fragment>
                  ))}
                </td>
                <td
                  className="py-3 px-3 text-sm text-center align-middle"
                  style={{ color: fg, borderBottom: `1px solid ${borderColor}` }}
                >
                  {years ?? "—"}
                </td>
                <td
                  className="py-3 px-3 text-sm text-center align-middle"
                  style={{ color: fg, borderBottom: `1px solid ${borderColor}` }}
                >
                  {lastUsed ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
