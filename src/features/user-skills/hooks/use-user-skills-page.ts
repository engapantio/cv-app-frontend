"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import {
  AddProfileSkillDocument,
  DeleteProfileSkillDocument,
  UpdateProfileSkillDocument,
  UserDocument,
  type UserQuery,
} from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import { useSkillsPageState } from "@/lib/skills/use-skills-page-state";
import { useSkillMutations } from "@/lib/skills/use-skill-mutations";
import type { SkillsCatalogInitial } from "@/lib/skills/group-skills";

export function useUserSkillsPage(
  userId: string,
  initialUser: UserQuery["user"] | null = null,
  initialCatalog?: SkillsCatalogInitial,
) {
  const { canEdit: canMutate } = usePermissions(userId);

  const {
    data: userData,
    loading: userLoading,
    refetch: refetchUser,
  } = useQuery(UserDocument, {
    variables: { userId },
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const user = userData?.user ?? initialUser;

  const profileSkills = useMemo(() => user?.profile?.skills ?? [], [user]);

  const {
    skillCategoryMap,
    skillsByCategory,
    availableSkills,
    removeMode,
    selectedSkills,
    addDialogOpen,
    setAddDialogOpen,
    updateSkillTarget,
    setUpdateSkillTarget,
    toggleSkillSelection,
    enterRemoveMode,
    cancelRemove,
    setSelectedSkills,
    setRemoveMode,
  } = useSkillsPageState(profileSkills, initialCatalog);

  const {
    handleAddSkill,
    handleUpdateSkill,
    handleDeleteSkills: deleteSkills,
    addingSkill,
    updatingSkill,
    deletingSkill,
  } = useSkillMutations({
    entityId: userId,
    idField: "userId",
    addDocument: AddProfileSkillDocument,
    updateDocument: UpdateProfileSkillDocument,
    deleteDocument: DeleteProfileSkillDocument,
    refetch: refetchUser,
    skillCategoryMap,
  });

  const handleDeleteSkills = useCallback(async () => {
    const ok = await deleteSkills(Array.from(selectedSkills));
    if (ok) {
      setSelectedSkills(new Set());
      setRemoveMode(false);
    }
  }, [deleteSkills, selectedSkills, setSelectedSkills, setRemoveMode]);

  return {
    loading: userLoading && user == null,
    hasUser: user != null,
    skillsByCategory,
    availableSkills,
    canMutate,
    removeMode,
    selectedSkills,
    toggleSkillSelection,
    enterRemoveMode,
    cancelRemove,
    addDialogOpen,
    setAddDialogOpen,
    updateSkillTarget,
    setUpdateSkillTarget,
    handleAddSkill,
    handleUpdateSkill,
    handleDeleteSkills,
    addingSkill,
    updatingSkill,
    deletingSkill,
  };
}
