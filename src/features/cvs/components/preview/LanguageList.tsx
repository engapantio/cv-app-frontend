import type { CvQuery } from "@/gql/generated/graphql";
import { PROFICIENCY_LABEL } from "@/lib/constants/proficiency";

type Languages = NonNullable<NonNullable<CvQuery["cv"]>["languages"]>;

export function LanguageList({ languages, color }: { languages: Languages; color?: string }) {
  if (!languages || languages.length === 0) {
    return (
      <p className="text-base" style={{ color: color ?? "var(--foreground)" }}>
        —
      </p>
    );
  }
  return (
    <div className="space-y-1">
      {languages.map((lang, i) => (
        <p key={i} className="text-base" style={{ color: color ?? "var(--foreground)" }}>
          {lang.name} &mdash; {PROFICIENCY_LABEL[lang.proficiency]}
        </p>
      ))}
    </div>
  );
}
