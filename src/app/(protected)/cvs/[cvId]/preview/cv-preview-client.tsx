"use client";

import { useMemo, useCallback, Fragment } from "react";
import { useMutation } from "@apollo/client/react";
import {
  ExportPdfDocument,
  type CvQuery,
  type SkillCategoriesQuery,
  type Proficiency,
} from "@/gql/generated/graphql";
import { toast } from "sonner";

type CvData = CvQuery["cv"];
type SkillCategories = SkillCategoriesQuery["skillCategories"];

interface Props {
  initialCv: CvData | null;
  skillCategories: SkillCategories;
  serverError: string | null;
  years: number | null;
  lastUsed: number | null;
}

const PROFICIENCY_LABEL: Record<Proficiency, string> = {
  A1: "A1",
  A2: "A2",
  B1: "B1",
  B2: "B2",
  C1: "C1",
  C2: "C2",
  Native: "Native",
};

const THEMES = {
  light: {
    background: "#ffffff",
    foreground: "#2e2e2e",
    primary: "#c63031",
    muted: "#bdbdbd",
    heading: "#2e2e2e",
  },
  dark: {
    background: "#121212",
    foreground: "#ffffff",
    primary: "#c63031",
    muted: "#757575",
    heading: "#ffffff",
  },
} as const;

function buildPrintHtml(
  cv: NonNullable<CvData>,
  years: number | null,
  lastUsed: number | null,
  categoryMap: Map<string, string>,
  skillsByCategory: Map<string, NonNullable<CvData["skills"]>>,
  uniqueDomains: string[],
  theme: "light" | "dark",
) {
  const t = THEMES[theme];
  const fullName = cv.user?.profile?.full_name ?? "Unknown";
  const positionName = cv.user?.position_name ?? "";
  const visibleYears = years ?? "—";
  const visibleLastUsed = lastUsed ?? "—";

  function esc(text: string) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function section(label: string, contentHtml: string) {
    return `<div style="margin-bottom:24px"><h2 style="font-size:16px;font-weight:700;margin:0 0 8px;color:${t.heading}">${esc(label)}</h2>${contentHtml}</div>`;
  }

  let languageHtml = "—";
  if (cv.languages && cv.languages.length > 0) {
    languageHtml = cv.languages
      .map(
        (l) =>
          `<p style="font-size:16px;margin:0;color:${t.foreground}">${esc(l.name)} — ${PROFICIENCY_LABEL[l.proficiency]}</p>`,
      )
      .join("");
  }

  let domainsHtml = "—";
  if (uniqueDomains.length > 0) {
    domainsHtml = uniqueDomains
      .map((d) => `<p style="font-size:16px;margin:0;color:${t.foreground}">${esc(d)}</p>`)
      .join("");
  }

  let skillsByCategoryHtml = "";
  if (skillsByCategory.size > 0) {
    skillsByCategoryHtml = [...skillsByCategory.entries()]
      .map(([catId, skills]) => {
        const catName = categoryMap.get(catId) ?? catId;
        return `<h4 style="font-size:16px;font-weight:700;margin:16px 0 4px;color:${t.foreground}">${esc(catName)}</h4>
<p style="font-size:16px;margin:0;color:${t.foreground}">${skills.map((s) => esc(s.name)).join(", ")}.</p>`;
      })
      .join("");
  }

  let projectsHtml = "";
  if (cv.projects && cv.projects.length > 0) {
    projectsHtml = cv.projects
      .map(
        (p) => `
      <div style="display:grid;grid-template-columns:260px 1fr;gap:0 32px;margin-bottom:32px">
        <div>
          <p style="font-size:16px;font-weight:700;margin:0;color:${t.primary}">${esc(p.name).toUpperCase()}</p>
          ${p.description ? `<p style="font-size:16px;margin:8px 0 0;color:${t.foreground}">${esc(p.description)}</p>` : ""}
        </div>
        <div style="border-left:2px solid ${t.primary};padding-left:32px">
          ${p.roles && p.roles.length > 0 ? `<div style="margin-bottom:12px"><span style="font-size:16px;font-weight:700;display:block;color:${t.foreground}">Project roles</span><p style="font-size:16px;margin:0;color:${t.foreground}">${esc(p.roles.join(", "))}</p></div>` : ""}
          <div style="margin-bottom:12px"><span style="font-size:16px;font-weight:700;display:block;color:${t.foreground}">Period</span><p style="font-size:16px;margin:0;color:${t.foreground}">${p.start_date ? formatDate(p.start_date) : "—"} – ${p.end_date ? formatDate(p.end_date) : "Till now"}</p></div>
          ${p.responsibilities && p.responsibilities.length > 0 ? `<div style="margin-bottom:12px"><span style="font-size:16px;font-weight:700;display:block;color:${t.foreground}">Responsibilities</span><ul style="margin:4px 0 0;padding-left:20px">${p.responsibilities.map((r) => `<li style="font-size:16px;color:${t.foreground}">${esc(r)}</li>`).join("")}</ul></div>` : ""}
          ${p.environment && p.environment.length > 0 ? `<div style="margin-bottom:12px"><span style="font-size:16px;font-weight:700;display:block;color:${t.foreground}">Environment</span><p style="font-size:16px;margin:0;color:${t.foreground}">${esc(p.environment.join(", "))}.</p></div>` : ""}
        </div>
      </div>`,
      )
      .join("");
  }

  const leftColumn = section("Education", `<p style="font-size:16px;margin:0;color:${t.foreground}">${esc(cv.education || "—")}</p>`)
    + section("Language proficiency", languageHtml)
    + section("Domains", domainsHtml);

  const rightColumn = section(
    `${esc(positionName || "Professional")} with ${visibleYears} years of experience`,
    `<p style="font-size:16px;line-height:1.5;margin:0;color:${t.foreground}">${esc(cv.description)}</p>`,
  ) + skillsByCategoryHtml;

  let skillsTableRows = "";
  if (skillsByCategory.size > 0) {
    skillsTableRows = [...skillsByCategory.entries()]
      .map(([catId, skills]) => {
        const catName = categoryMap.get(catId) ?? catId;
        const skillsHtml = skills.map((s) => esc(s.name)).join("<br>");
        return `<tr>
          <td style="padding:8px 12px;font-size:14px;font-weight:700;border-bottom:1px solid ${t.muted};color:${t.primary}">${esc(catName)}</td>
          <td style="padding:8px 12px;font-size:14px;font-weight:700;border-bottom:1px solid ${t.muted};color:${t.foreground}">${skillsHtml}</td>
          <td style="padding:8px 12px;font-size:14px;text-align:center;border-bottom:1px solid ${t.muted};color:${t.foreground}">${visibleYears}</td>
          <td style="padding:8px 12px;font-size:14px;text-align:center;border-bottom:1px solid ${t.muted};color:${t.foreground}">${visibleLastUsed}</td>
        </tr>`;
      })
      .join("");
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { margin: 0; size: A4; }
    html, body { height: 100%; }
    body {
      font-family: Roboto, Arial, Helvetica, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      margin: 0;
      padding: 20mm;
      color: ${t.foreground};
      background-color: ${t.background};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1 { font-size: 34px; font-weight: 400; margin: 0 0 4px; letter-spacing: 0.25px; color: ${t.foreground}; }
    h3 { font-size: 34px; font-weight: 400; margin: 32px 0 16px; color: ${t.heading}; }
    .grid-2col { display: grid; grid-template-columns: 260px 1fr; gap: 0 32px; }
    .skills-table { width: 100%; border-collapse: collapse; }
    .skills-table th {
      padding: 8px 12px;
      font-size: 14px;
      font-weight: 500;
      border-bottom: 1px solid ${t.primary};
      color: ${t.foreground};
    }
    .skills-table th:nth-child(3),
    .skills-table td:nth-child(3),
    .skills-table th:nth-child(4),
    .skills-table td:nth-child(4) { text-align: center; }
    .skills-table th:nth-child(2),
    .skills-table td:nth-child(2) { text-align: left; }
    .skills-table th { border-left: none; border-right: none; }
    .skills-table td { border-left: none; border-right: none; }
  </style>
</head>
<body>
  <h1>${esc(fullName)}</h1>
  ${positionName ? `<p style="font-size:16px;margin:0 0 16px;color:${t.foreground}">${esc(positionName)}</p>` : ""}

  <div class="grid-2col">
    <div>${leftColumn}</div>
    <div style="border-left:2px solid ${t.primary};padding-left:32px">${rightColumn}</div>
  </div>

  ${projectsHtml ? `<h3>Projects</h3>${projectsHtml}` : ""}

  <h3>Professional skills</h3>
  <table class="skills-table">
    <thead>
      <tr>
        <th style="vertical-align:top">SKILLS</th>
        <th></th>
        <th style="padding:8px 12px;text-align:center;vertical-align:middle">
          <span style="display:block">EXPERIENCE</span>
          <span style="display:block">IN YEARS</span>
        </th>
        <th style="text-align:center;vertical-align:top">LAST USED</th>
      </tr>
    </thead>
    <tbody>
      ${skillsTableRows}
    </tbody>
  </table>
</body>
</html>`;
}

export function CvPreviewClient({
  initialCv,
  serverError,
  skillCategories,
  years,
  lastUsed,
}: Props) {
  const [exportPdf, { loading: exporting }] = useMutation(ExportPdfDocument);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of skillCategories) {
      map.set(cat.id, cat.name);
    }
    return map;
  }, [skillCategories]);

  const skillsByCategory = useMemo(() => {
    const groups = new Map<string, NonNullable<CvData["skills"]>>();
    for (const skill of initialCv?.skills ?? []) {
      const catId = skill.categoryId ?? "uncategorized";
      if (!groups.has(catId)) groups.set(catId, []);
      groups.get(catId)!.push(skill);
    }
    return groups;
  }, [initialCv]);

  const uniqueDomains = useMemo(() => {
    const domains = new Set<string>();
    for (const p of initialCv?.projects ?? []) {
      if (p.domain) domains.add(p.domain);
    }
    return [...domains];
  }, [initialCv]);

  const handleExportPdf = useCallback(async () => {
    if (!initialCv) {
      toast("No preview content to export");
      return;
    }

    const isDark = document.documentElement.classList.contains("dark");
    const resolvedTheme = isDark ? "dark" : "light";
    const html = buildPrintHtml(
      initialCv,
      years,
      lastUsed,
      categoryMap,
      skillsByCategory,
      uniqueDomains,
      resolvedTheme,
    );

    try {
      const { data } = await exportPdf({
        variables: {
          pdf: {
            html,
            margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
          },
        },
      });

      if (data?.exportPdf) {
        const byteChars = atob(data.exportPdf);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNums[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNums);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${initialCv?.name ?? "cv"}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast("PDF exported successfully");
      }
    } catch {
      toast("Failed to export PDF");
    }
  }, [exportPdf, initialCv, years, lastUsed, categoryMap, skillsByCategory, uniqueDomains]);

  if (serverError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive">{serverError}</p>
      </div>
    );
  }

  if (!initialCv) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const cv = initialCv;
  const fullName = cv.user?.profile?.full_name ?? "Unknown";
  const positionName = cv.user?.position_name ?? "";

  return (
    <div className="mx-auto w-full max-w-225">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-[34px] font-normal leading-10.5 tracking-[0.25px]"
            style={{ color: "var(--foreground)" }}
          >
            {fullName}
          </h1>
          {positionName && (
            <p className="text-base mt-1" style={{ color: "var(--foreground)" }}>
              {positionName}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={exporting}
          className="shrink-0 h-10 px-4 rounded-full border text-sm font-medium uppercase tracking-[0.4px] bg-transparent cursor-pointer disabled:opacity-50"
          style={{
            borderColor: "rgba(198, 48, 49, 0.5)",
            color: "#c63031",
            minWidth: 160,
          }}
        >
          {exporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-[1440px]:grid-cols-[260px_592px] gap-x-8 gap-y-0">
        <div className="space-y-6">
          <Section label="Education">
            <p className="text-base" style={{ color: "var(--foreground)" }}>
              {cv.education || "—"}
            </p>
          </Section>

          <Section label="Language proficiency">
            {cv.languages && cv.languages.length > 0 ? (
              <div className="space-y-1">
                {cv.languages.map((lang, i) => (
                  <p key={i} className="text-base" style={{ color: "var(--foreground)" }}>
                    {lang.name} &mdash; {PROFICIENCY_LABEL[lang.proficiency]}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-base" style={{ color: "var(--foreground)" }}>
                —
              </p>
            )}
          </Section>

          <Section label="Domains">
            {uniqueDomains.length > 0 ? (
              <div className="space-y-1">
                {uniqueDomains.map((domain, i) => (
                  <p key={i} className="text-base" style={{ color: "var(--foreground)" }}>
                    {domain}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-base" style={{ color: "var(--foreground)" }}>
                —
              </p>
            )}
          </Section>
        </div>

        <div
          className="md:border-l-2 pl-0 md:pl-8 pt-6 md:pt-0"
          style={{ borderColor: "#c63031" }}
        >
          <Section label={`${positionName || "Professional"} with ${years ?? "N/A"} years of experience`}>
            <p className="text-base leading-relaxed" style={{ color: "var(--foreground)" }}>
              {cv.description}
            </p>
          </Section>

          {[...skillsByCategory.entries()].map(([catId, skills]) => {
            const catName = categoryMap.get(catId) ?? catId;
            return (
              <div key={catId} className="mt-4">
                <Section label={catName}>
                  <p className="text-base" style={{ color: "var(--foreground)" }}>
                    {skills.map((s) => s.name).join(", ")}.
                  </p>
                </Section>
              </div>
            );
          })}
        </div>
      </div>

      {cv.projects && cv.projects.length > 0 && (
        <>
          <h3
            className="text-[34px] font-normal leading-10.5 tracking-[0.25px] mt-12 mb-6"
            style={{ color: "var(--foreground)" }}
          >
            Projects
          </h3>

          <div className="space-y-8">
            {cv.projects.map((project) => (
              <div
                key={project.id}
                className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-[1440px]:grid-cols-[260px_592px] gap-x-8 gap-y-2"
              >
                <div>
                  <p
                    className="text-base font-bold"
                    style={{ color: "#c63031" }}
                  >
                    {project.name.toUpperCase()}
                  </p>
                  {project.description && (
                    <p
                      className="text-base mt-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      {project.description}
                    </p>
                  )}
                </div>

                <div
                  className="md:border-l-2 pl-0 md:pl-8 pt-4 md:pt-0"
                  style={{ borderColor: "#c63031" }}
                >
                  {project.roles && project.roles.length > 0 && (
                    <div className="mb-3">
                      <span
                        className="text-base font-bold block"
                        style={{ color: "var(--foreground)" }}
                      >
                        Project roles
                      </span>
                      <p className="text-base" style={{ color: "var(--foreground)" }}>
                        {project.roles.join(", ")}
                      </p>
                    </div>
                  )}

                  <div className="mb-3">
                    <span
                      className="text-base font-bold block"
                      style={{ color: "var(--foreground)" }}
                    >
                      Period
                    </span>
                    <p className="text-base" style={{ color: "var(--foreground)" }}>
                      {project.start_date
                        ? formatDate(project.start_date)
                        : "—"}{" "}
                      &ndash;{" "}
                      {project.end_date
                        ? formatDate(project.end_date)
                        : "Till now"}
                    </p>
                  </div>

                  {project.responsibilities && project.responsibilities.length > 0 && (
                    <div className="mb-3">
                      <span
                        className="text-base font-bold block"
                        style={{ color: "var(--foreground)" }}
                      >
                        Responsibilities
                      </span>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {project.responsibilities.map((resp, i) => (
                          <li
                            key={i}
                            className="text-base"
                            style={{ color: "var(--foreground)" }}
                          >
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.environment && project.environment.length > 0 && (
                    <div className="mb-3">
                      <span
                        className="text-base font-bold block"
                        style={{ color: "var(--foreground)" }}
                      >
                        Environment
                      </span>
                      <p className="text-base" style={{ color: "var(--foreground)" }}>
                        {project.environment.join(", ")}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h3
        className="text-[34px] font-normal leading-10.5 tracking-[0.25px] mt-12 mb-6"
        style={{ color: "var(--foreground)" }}
      >
        Professional skills
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                className="text-left font-medium text-sm py-3 px-3 align-top"
                style={{ color: "var(--foreground)", borderBottom: "1px solid #c63031" }}
              >
                SKILLS
              </th>
              <th
                className="text-left font-medium text-sm py-3 px-3"
                style={{ color: "var(--foreground)", borderBottom: "1px solid #c63031" }}
              >
              </th>
              <th
                className="text-center font-medium text-sm py-3 px-3 leading-tight"
                style={{ color: "var(--foreground)", borderBottom: "1px solid #c63031", verticalAlign: "middle" }}
              >
                <span className="block">EXPERIENCE</span>
                <span className="block">IN YEARS</span>
              </th>
              <th
                className="text-center font-medium text-sm py-3 px-3 align-top"
                style={{ color: "var(--foreground)", borderBottom: "1px solid #c63031" }}
              >
                LAST USED
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
                    style={{ color: "#c63031", borderBottom: "1px solid #bdbdbd" }}
                  >
                    {catName}
                  </td>
                  <td
                    className="py-3 px-3 text-sm font-bold align-top"
                    style={{ color: "var(--foreground)", borderBottom: "1px solid #bdbdbd" }}
                  >
                    {skills.map((s, i) => (
                      <Fragment key={i}>
                        {i > 0 && <br />}{s.name}
                      </Fragment>
                    ))}
                  </td>
                  <td
                    className="py-3 px-3 text-sm text-center align-middle"
                    style={{ color: "var(--foreground)", borderBottom: "1px solid #bdbdbd" }}
                  >
                    {years ?? "—"}
                  </td>
                  <td
                    className="py-3 px-3 text-sm text-center align-middle"
                    style={{ color: "var(--foreground)", borderBottom: "1px solid #bdbdbd" }}
                  >
                    {lastUsed ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>
        {label}
      </h2>
      {children}
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}.${yyyy}`;
  } catch {
    return dateStr;
  }
}
