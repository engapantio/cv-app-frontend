"use client";
import { useSession } from "@/lib/auth/session";
import { useServerUser } from "@/lib/auth/server-user-context";

export function usePermissions(targetUserId?: string | null) {
  const { user: sessionUser } = useSession();
  const serverUser = useServerUser();
  const user = sessionUser ?? serverUser;
  const currentUserId = user?.id;
  const isAdmin = user?.role === "Admin";
  const isOwner = targetUserId != null && currentUserId === targetUserId;
  const canEdit = isOwner || isAdmin;

  return { currentUserId, isAdmin, isOwner, canEdit, user };
}
