import { isDuplicateEmailError, DuplicateEmailError } from "./errors";

describe("errors", () => {
  describe("isDuplicateEmailError", () => {
    it("returns true for a DuplicateEmailError instance", () => {
      expect(isDuplicateEmailError(new DuplicateEmailError())).toBe(true);
    });

    it("matches graphQLErrors messages that mention a unique constraint", () => {
      const error = {
        graphQLErrors: [{ message: "duplicate key value violates unique constraint" }],
      };
      expect(isDuplicateEmailError(error)).toBe(true);
    });

    it("matches an 'already exists' message on a plain error", () => {
      expect(isDuplicateEmailError(new Error("Email already exists"))).toBe(true);
    });

    it("returns false for unrelated errors", () => {
      expect(isDuplicateEmailError(new Error("network error"))).toBe(false);
    });

    it("returns false for non-object errors", () => {
      expect(isDuplicateEmailError("boom")).toBe(false);
    });

    it("returns false when graphQLErrors is present but does not match", () => {
      const error = { graphQLErrors: [{ message: "something else" }] };
      expect(isDuplicateEmailError(error)).toBe(false);
    });

    it("falls back to a non-string message", () => {
      const error = { message: 42 };
      expect(isDuplicateEmailError(error)).toBe(false);
    });

    it("ignores graphQLErrors entries without a message string", () => {
      const error = { graphQLErrors: [{}] };
      expect(isDuplicateEmailError(error)).toBe(false);
    });
  });

  describe("DuplicateEmailError", () => {
    it("exposes a friendly message and name", () => {
      const error = new DuplicateEmailError();
      expect(error.message).toBe("This email is already registered");
      expect(error.name).toBe("DuplicateEmailError");
      expect(error).toBeInstanceOf(Error);
    });
  });
});
