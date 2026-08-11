import { orderUsers } from "./order-users";
import type { UserItem } from "./types";

const base = {
  created_at: "2024-01-01T00:00:00Z",
  email: "a@example.com",
  is_verified: true,
  role: "Employee" as const,
  department_name: null,
  position_name: null,
  profile: {
    id: "p",
    created_at: "2024-01-01T00:00:00Z",
    first_name: null,
    last_name: null,
    full_name: null,
    avatar: null,
  },
  department: null,
  position: null,
  cvs: [],
};

function user(id: string): UserItem {
  return { ...base, id, email: `${id}@example.com` } as unknown as UserItem;
}

const users = [user("3"), user("1"), user("2")];

describe("orderUsers", () => {
  it("sorts by descending id when the viewer is an admin", () => {
    expect(orderUsers(users, "1", true).map((u) => u.id)).toEqual(["3", "2", "1"]);
  });

  it("returns users untouched when there is no current user and not admin", () => {
    const input = [user("3"), user("1")];
    expect(orderUsers(input, null, false)).toBe(input);
  });

  it("pins the current user first, then sorts the rest ascending", () => {
    const result = orderUsers(users, "2", false);
    expect(result.map((u) => u.id)).toEqual(["2", "1", "3"]);
  });

  it("returns an empty array when given no users", () => {
    expect(orderUsers([], "1", true)).toEqual([]);
  });

  it("handles the current user not being present in the list", () => {
    const result = orderUsers(users, "99", false);
    expect(result.map((u) => u.id)).toEqual(["1", "2", "3"]);
  });
});
