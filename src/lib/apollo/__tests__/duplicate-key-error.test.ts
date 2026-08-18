import { isDuplicateKeyError, isDuplicateKeyMessage } from "../duplicate-key-error";

describe("isDuplicateKeyMessage", () => {
  it("matches a unique constraint violation", () => {
    expect(
      isDuplicateKeyMessage('duplicate key value violates unique constraint "UQ_abc123"'),
    ).toBe(true);
  });

  it("matches an 'already exists' message", () => {
    expect(isDuplicateKeyMessage("Language already exists")).toBe(true);
  });

  it("returns false for unrelated messages", () => {
    expect(isDuplicateKeyMessage("network error")).toBe(false);
  });
});

describe("isDuplicateKeyError", () => {
  it("matches graphQLErrors messages that mention a unique constraint", () => {
    const error = {
      graphQLErrors: [{ message: "duplicate key value violates unique constraint" }],
    };
    expect(isDuplicateKeyError(error)).toBe(true);
  });

  it("matches an 'already exists' message on a plain error", () => {
    expect(isDuplicateKeyError(new Error("Language already exists"))).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isDuplicateKeyError(new Error("network error"))).toBe(false);
  });

  it("returns false for non-object errors", () => {
    expect(isDuplicateKeyError("boom")).toBe(false);
  });

  it("returns false when graphQLErrors is present but does not match", () => {
    const error = { graphQLErrors: [{ message: "something else" }] };
    expect(isDuplicateKeyError(error)).toBe(false);
  });

  it("falls back to a non-string message", () => {
    const error = { message: 42 };
    expect(isDuplicateKeyError(error)).toBe(false);
  });

  it("ignores graphQLErrors entries without a message string", () => {
    const error = { graphQLErrors: [{}] };
    expect(isDuplicateKeyError(error)).toBe(false);
  });
});
