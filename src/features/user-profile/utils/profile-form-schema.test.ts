import { profileSchema } from "./profile-form-schema";

describe("profile-form-schema", () => {
  it("accepts a valid profile with all fields", () => {
    const result = profileSchema.safeParse({
      first_name: "Alice",
      last_name: "Smith",
      departmentId: "d1",
      positionId: "p1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when no profile field is filled", () => {
    const result = profileSchema.safeParse({
      first_name: undefined,
      last_name: undefined,
      departmentId: undefined,
      positionId: undefined,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("At least one profile field must be filled");
      expect(result.error.issues[0].path[0]).toBe("first_name");
    }
  });

  it("accepts a single filled field", () => {
    const result = profileSchema.safeParse({
      first_name: "Alice",
      last_name: undefined,
      departmentId: undefined,
      positionId: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a first name that exceeds the max length", () => {
    const result = profileSchema.safeParse({
      first_name: "x".repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("First name must be 100 characters or less");
    }
  });

  it("rejects a department id that exceeds the max length", () => {
    const result = profileSchema.safeParse({
      departmentId: "x".repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Department must be 100 characters or less");
    }
  });
});
