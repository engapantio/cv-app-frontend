"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { CvDocument, UpdateCvDocument } from "@/gql/generated/graphql";
import { useSession } from "@/lib/auth/session";

export function useCvDetails(cvId: string) {
  const { user: currentUser } = useSession();

  const { data, loading } = useQuery(CvDocument, {
    variables: { cvId },
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const [updateCv, { loading: updating }] = useMutation(UpdateCvDocument);

  const cv = data?.cv ?? null;
  const cvUserId = cv?.user?.id;
  const currentUserId = currentUser?.id;
  const isAdmin = currentUser?.role === "Admin";
  const isOwner = currentUserId === cvUserId;
  const canEdit = !!(isOwner || isAdmin);

  return {
    cv,
    loading,
    updating,
    updateCv,
    canEdit,
    isOwner,
    isAdmin,
  };
}
