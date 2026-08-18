import { isDuplicateKeyError } from "@/lib/apollo/duplicate-key-error";

export function isDuplicateEmailError(error: unknown): boolean {
  return error instanceof DuplicateEmailError || isDuplicateKeyError(error);
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("This email is already registered");
    this.name = "DuplicateEmailError";
  }
}
