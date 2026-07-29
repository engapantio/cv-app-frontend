export function DomainList({ domains, color }: { domains: string[]; color?: string }) {
  if (domains.length === 0) {
    return (
      <p className="text-base" style={{ color: color ?? "var(--foreground)" }}>
        —
      </p>
    );
  }
  return (
    <div className="space-y-1">
      {domains.map((domain, i) => (
        <p key={i} className="text-base" style={{ color: color ?? "var(--foreground)" }}>
          {domain}
        </p>
      ))}
    </div>
  );
}
