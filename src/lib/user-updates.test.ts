import { buildUserUpdateOperations } from "./user-updates";
import type { UserRole } from "@/gql/generated/graphql";

const updateProfile = jest.fn(() => Promise.resolve({ data: null }));
const updateUser = jest.fn(() => Promise.resolve({ data: null }));

const updaters = { updateProfile, updateUser };

const base = {
  userId: "u1",
  first_name: "Alice",
  last_name: "Smith",
  departmentId: "d1",
  positionId: "pos1",
};

const current = { ...base, role: "Employee" as UserRole };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("buildUserUpdateOperations", () => {
  it("returns an empty list when nothing changed", () => {
    const operations = buildUserUpdateOperations(base, current, updaters);
    expect(operations).toHaveLength(0);
  });

  it("builds a profile operation for name changes", () => {
    const operations = buildUserUpdateOperations(
      { ...base, first_name: "Alicia" },
      current,
      updaters,
    );
    expect(operations).toHaveLength(1);
    expect(operations[0].kind).toBe("profile");
  });

  it("builds a user operation for employment changes, mapping null to empty strings", async () => {
    const operations = buildUserUpdateOperations(
      { ...base, departmentId: null },
      current,
      updaters,
    );
    expect(operations).toHaveLength(1);
    expect(operations[0].kind).toBe("user");

    await operations[0].run();

    expect(updateUser).toHaveBeenCalledWith({
      variables: { user: { userId: "u1", departmentId: "", positionId: "pos1" } },
    });
  });

  it("includes role in the user operation only when it changed", async () => {
    const operations = buildUserUpdateOperations({ ...base, role: "Admin" }, current, updaters);
    expect(operations).toHaveLength(1);

    await operations[0].run();

    expect(updateUser).toHaveBeenCalledWith({
      variables: {
        user: { userId: "u1", departmentId: "d1", positionId: "pos1", role: "Admin" },
      },
    });
  });

  it("orders the profile operation before the user operation", async () => {
    const operations = buildUserUpdateOperations(
      { ...base, first_name: "Alicia", role: "Admin" },
      current,
      updaters,
    );
    expect(operations.map((op) => op.kind)).toEqual(["profile", "user"]);

    await operations[0].run();

    expect(updateProfile).toHaveBeenCalledWith({
      variables: {
        profile: { userId: "u1", first_name: "Alicia", last_name: "Smith" },
      },
    });
  });

  it("does not emit a user operation when role is omitted and employment is unchanged", () => {
    const operations = buildUserUpdateOperations(base, { ...current, role: null }, updaters);
    expect(operations).toHaveLength(0);
  });

  it("defers invocation until run() is called", () => {
    const operations = buildUserUpdateOperations({ ...base, role: "Admin" }, current, updaters);
    expect(updateUser).not.toHaveBeenCalled();

    void operations[0].run();

    expect(updateUser).toHaveBeenCalled();
  });
});
