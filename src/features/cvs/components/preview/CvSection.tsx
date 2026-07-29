interface Props {
  label: string;
  children: React.ReactNode;
  color?: string;
}

export function CvSection({ label, children, color }: Props) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold mb-1" style={{ color: color ?? "var(--foreground)" }}>
        {label}
      </h2>
      {children}
    </div>
  );
}
