"use client";

import { useMemo, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { renderToString } from "react-dom/server";
import {
  ExportPdfDocument,
  type CvQuery,
  type SkillCategoriesQuery,
} from "@/gql/generated/graphql";
import { THEMES } from "@/lib/constants/themes";
import { CvSection } from "@/features/cvs/components/preview/CvSection";
import { LanguageList } from "@/features/cvs/components/preview/LanguageList";
import { DomainList } from "@/features/cvs/components/preview/DomainList";
import { ProjectCard } from "@/features/cvs/components/preview/ProjectCard";
import { SkillsTable } from "@/features/cvs/components/preview/SkillsTable";
import { PrintableCv } from "@/features/cvs/components/preview/PrintableCv";
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
    const colors = THEMES[resolvedTheme];

    const bodyHtml = renderToString(
      <PrintableCv
        cv={initialCv}
        years={years}
        lastUsed={lastUsed}
        categoryMap={categoryMap}
        skillsByCategory={skillsByCategory}
        uniqueDomains={uniqueDomains}
        colors={colors}
      />,
    );

    const html = `<!DOCTYPE html>
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
      color: ${colors.foreground};
      background-color: ${colors.background};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1 { font-size: 34px; font-weight: 400; margin: 0 0 4px; letter-spacing: 0.25px; }
    h3 { font-size: 34px; font-weight: 400; margin: 32px 0 16px; }
    ul { margin: 4px 0 0; padding-left: 20px; }
    li { font-size: 16px; }
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .md\:grid-cols-\[260px_1fr\] { grid-template-columns: 260px 1fr; }
    .min-\[1440px\]\:grid-cols-\[260px_592px\] { grid-template-columns: 260px 592px; }
    .gap-x-4 { column-gap: 1rem; }
    .gap-y-0 { row-gap: 0; }
    .gap-y-2 { row-gap: 0.5rem; }
    .w-full { width: 100%; }
    .overflow-x-auto { overflow-x: auto; }
    .block { display: block; }
    .space-y-1 > * + * { margin-top: 0.25rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .md\:border-l-2 { border-left-width: 2px; }
    .md\:pl-8 { padding-left: 2rem; }
    .md\:pt-0 { padding-top: 0; }
    .pl-0 { padding-left: 0; }
    .pl-5 { padding-left: 1.25rem; }
    .pt-4 { padding-top: 1rem; }
    .text-base { font-size: 16px; }
    .text-sm { font-size: 14px; }
    .font-bold { font-weight: 700; }
    .font-medium { font-weight: 500; }
    .leading-tight { line-height: 1.25; }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .list-disc { list-style-type: disc; }
    .align-top { vertical-align: top; }
    .align-middle { vertical-align: middle; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;

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

  const fgStyle = { color: "var(--foreground)" } as const;

  return (
    <div className="mx-auto w-full max-w-225">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[34px] font-normal leading-10.5 tracking-[0.25px]" style={fgStyle}>
            {fullName}
          </h1>
          {positionName && (
            <p className="text-base mt-1" style={fgStyle}>
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

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-[1440px]:grid-cols-[260px_592px] gap-x-4 gap-y-0">
        <div className="space-y-6">
          <CvSection label="Education">
            <p className="text-base" style={fgStyle}>
              {cv.education || "—"}
            </p>
          </CvSection>

          <CvSection label="Language proficiency">
            <LanguageList languages={cv.languages ?? []} />
          </CvSection>

          <CvSection label="Domains">
            <DomainList domains={uniqueDomains} />
          </CvSection>
        </div>

        <div className="md:border-l-2 pl-0 md:pl-8 pt-6 md:pt-0" style={{ borderColor: "#c63031" }}>
          <CvSection
            label={`${positionName || "Professional"} with ${years ?? "N/A"} years of experience`}
          >
            <p className="text-base leading-relaxed" style={fgStyle}>
              {cv.description}
            </p>
          </CvSection>

          {[...skillsByCategory.entries()].map(([catId, skills]) => {
            const catName = categoryMap.get(catId) ?? catId;
            return (
              <div key={catId} className="mt-4">
                <CvSection label={catName}>
                  <p className="text-base" style={fgStyle}>
                    {skills.map((s) => s.name).join(", ")}.
                  </p>
                </CvSection>
              </div>
            );
          })}
        </div>
      </div>

      {cv.projects && cv.projects.length > 0 && (
        <>
          <h3
            className="text-[34px] font-normal leading-10.5 tracking-[0.25px] mt-12 mb-6"
            style={fgStyle}
          >
            Projects
          </h3>

          <div className="space-y-8">
            {cv.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      )}

      <h3
        className="text-[34px] font-normal leading-10.5 tracking-[0.25px] mt-12 mb-6"
        style={fgStyle}
      >
        Professional skills
      </h3>

      <SkillsTable
        skillsByCategory={skillsByCategory}
        categoryMap={categoryMap}
        years={years}
        lastUsed={lastUsed}
      />
    </div>
  );
}
