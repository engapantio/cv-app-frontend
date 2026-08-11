import type { UpdateUserInput, UserRole } from "@/gql/generated/graphql";

export interface UserEditFields {
  userId: string;
  first_name: string;
  last_name: string;
  departmentId: string | null;
  positionId: string | null;
  role?: UserRole;
}

export interface UserEditBaseline {
  first_name?: string | null;
  last_name?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  role?: UserRole | null;
}

export interface UserUpdateUpdaters {
  updateProfile: (options: {
    variables: { profile: { userId: string; first_name: string; last_name: string } };
  }) => Promise<unknown>;
  updateUser: (options: { variables: { user: UpdateUserInput } }) => Promise<unknown>;
}

export type UserUpdateOperation = {
  kind: "profile" | "user";
  run: () => Promise<unknown>;
};

export function buildUserUpdateOperations(
  next: UserEditFields,
  current: UserEditBaseline,
  updaters: UserUpdateUpdaters,
): UserUpdateOperation[] {
  const operations: UserUpdateOperation[] = [];

  const namesChanged =
    next.first_name !== (current.first_name ?? "") || next.last_name !== (current.last_name ?? "");
  const departmentChanged = next.departmentId !== (current.departmentId ?? null);
  const positionChanged = next.positionId !== (current.positionId ?? null);
  const roleChanged = next.role != null && next.role !== current.role;

  if (namesChanged) {
    operations.push({
      kind: "profile",
      run: () =>
        updaters.updateProfile({
          variables: {
            profile: {
              userId: next.userId,
              first_name: next.first_name,
              last_name: next.last_name,
            },
          },
        }),
    });
  }

  if (departmentChanged || positionChanged || roleChanged) {
    const user: UpdateUserInput = {
      userId: next.userId,
      departmentId: next.departmentId ?? "",
      positionId: next.positionId ?? "",
    };
    if (roleChanged && next.role) user.role = next.role;
    operations.push({
      kind: "user",
      run: () => updaters.updateUser({ variables: { user } }),
    });
  }

  return operations;
}
