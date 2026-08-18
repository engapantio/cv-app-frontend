const DUPLICATE_KEY_PATTERN = /duplicate key value violates unique constraint|already exists/i;

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

export function isDuplicateKeyMessage(message: string): boolean {
  return DUPLICATE_KEY_PATTERN.test(message);
}

export function isDuplicateKeyError(error: unknown): boolean {
  return collectMessages(error).some(isDuplicateKeyMessage);
}
