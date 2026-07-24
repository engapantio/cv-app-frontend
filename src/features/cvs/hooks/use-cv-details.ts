"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { CvDocument, UpdateCvDocument } from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";

export function useCvDetails(cvId: string) {
  const { data, loading } = useQuery(CvDocument, {
    variables: { cvId },
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const [updateCv, { loading: updating }] = useMutation(UpdateCvDocument);

  const cv = data?.cv ?? null;
  const { canEdit, isOwner, isAdmin } = usePermissions(cv?.user?.id);

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
