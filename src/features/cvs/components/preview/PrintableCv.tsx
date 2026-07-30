import type { CvQuery } from "@/gql/generated/graphql";
import type { ThemeColors } from "@/lib/constants/themes";
import { CvSection } from "./CvSection";
import { LanguageList } from "./LanguageList";
import { DomainList } from "./DomainList";
import { ProjectCard } from "./ProjectCard";
import { SkillsTable } from "./SkillsTable";

type CvData = CvQuery["cv"];

interface Props {
  cv: NonNullable<CvData>;
  years: number | null;
  lastUsed: number | null;
  categoryMap: Map<string, string>;
  skillsByCategory: Map<string, NonNullable<CvData["skills"]>>;
  uniqueDomains: string[];
  colors: ThemeColors;
}

export function PrintableCv({
  cv,
  years,
  lastUsed,
  categoryMap,
  skillsByCategory,
  uniqueDomains,
  colors,
}: Props) {
  const fullName = cv.user?.profile?.full_name ?? "Unknown";
  const positionName = cv.user?.position_name ?? "";
  const c = colors;

  return (
    <>
      <h1
        style={{
          fontSize: 34,
          fontWeight: 400,
          margin: "0 0 4px",
          letterSpacing: "0.25px",
          color: c.foreground,
        }}
      >
        {fullName}
      </h1>
      {positionName && (
        <p style={{ fontSize: 16, margin: "0 0 16px", color: c.foreground }}>{positionName}</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "0 16px",
        }}
      >
        <div>
          <CvSection label="Education" color={c.foreground}>
            <p style={{ fontSize: 16, margin: 0, color: c.foreground }}>{cv.education || "—"}</p>
          </CvSection>

          <CvSection label="Language proficiency" color={c.foreground}>
            <LanguageList languages={cv.languages ?? []} color={c.foreground} />
          </CvSection>

          <CvSection label="Domains" color={c.foreground}>
            <DomainList domains={uniqueDomains} color={c.foreground} />
          </CvSection>
        </div>

        <div
          style={{
            borderLeft: `2px solid ${c.primary}`,
            paddingLeft: 32,
          }}
        >
          <CvSection
            label={`${positionName || "Professional"} with ${years ?? "N/A"} years of experience`}
            color={c.foreground}
          >
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.5,
                margin: 0,
                color: c.foreground,
              }}
            >
              {cv.description}
            </p>
          </CvSection>

          {[...skillsByCategory.entries()].map(([catId, skills]) => {
            const catName = categoryMap.get(catId) ?? catId;
            return (
              <div key={catId} style={{ marginTop: 16 }}>
                <CvSection label={catName} color={c.foreground}>
                  <p style={{ fontSize: 16, margin: 0, color: c.foreground }}>
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
            style={{
              fontSize: 34,
              fontWeight: 400,
              margin: "32px 0 16px",
              color: c.foreground,
            }}
          >
            Projects
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {cv.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                color={c.foreground}
                primary={c.primary}
              />
            ))}
          </div>
        </>
      )}

      <h3
        style={{
          fontSize: 34,
          fontWeight: 400,
          margin: "32px 0 16px",
          color: c.foreground,
        }}
      >
        Professional skills
      </h3>
      <SkillsTable
        skillsByCategory={skillsByCategory}
        categoryMap={categoryMap}
        years={years}
        lastUsed={lastUsed}
        color={c.foreground}
        primary={c.primary}
        muted={c.muted}
      />
    </>
  );
}
