const DUPLICATE_EMAIL_PATTERN = /duplicate key value violates unique constraint|already exists/i;

function collectMessages(error: unknown): string[] {
  if (typeof error !== "object" || error === null) {
    return [String(error)];
  }
  const candidate = error as { graphQLErrors?: Array<{ message?: string }>; message?: unknown };
  const graphQLErrors = Array.isArray(candidate.graphQLErrors)
    ? candidate.graphQLErrors
        .map(({ message }) => message)
        .filter((message): message is string => Boolean(message))
    : [];
  if (graphQLErrors.length > 0) {
    return graphQLErrors;
  }
  return [typeof candidate.message === "string" ? candidate.message : String(error)];
}

export function isDuplicateEmailError(error: unknown): boolean {
  return (
    error instanceof DuplicateEmailError ||
    collectMessages(error).some((message) => DUPLICATE_EMAIL_PATTERN.test(message))
  );
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("This email is already registered");
    this.name = "DuplicateEmailError";
  }
}
