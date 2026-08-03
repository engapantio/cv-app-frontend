import type { UserItem } from "@/features/users/types";

export function orderUsers(
  users: UserItem[],
  currentUserId: string | null,
  isAdmin: boolean,
): UserItem[] {
  if (isAdmin) {
    return [...users].sort((a, b) => Number(b.id) - Number(a.id));
  }
  if (!currentUserId) return users;
  const own = users.filter((u) => u.id === currentUserId);
  const others = users
    .filter((u) => u.id !== currentUserId)
    .sort((a, b) => Number(a.id) - Number(b.id));
  return [...own, ...others];
}
