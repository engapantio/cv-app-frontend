export interface ParsedRoles {
  roles: string[];
  responsibilities: string[];
}

export function parseRoles(input: string): ParsedRoles {
  const roles: string[] = [];
  const responsibilities: string[] = [];

  const segments = input
    .replace(/\.\s*/g, "\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const segment of segments) {
    const words = segment.split(/\s+/);
    if (words.length === 1) {
      roles.push(segment);
    } else {
      responsibilities.push(segment);
    }
  }

  return { roles, responsibilities };
}
