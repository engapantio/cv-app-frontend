"use client";
import { useSession } from "@/lib/auth/session";

export function usePermissions(targetUserId?: string | null) {
  const { user } = useSession();
  const currentUserId = user?.id;
  const isAdmin = user?.role === "Admin";
  const isOwner = targetUserId != null && currentUserId === targetUserId;
  const canEdit = isOwner || isAdmin;

  return { currentUserId, isAdmin, isOwner, canEdit, user };
}
