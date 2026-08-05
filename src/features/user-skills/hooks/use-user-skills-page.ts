"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import {
  AddProfileSkillDocument,
  DeleteProfileSkillDocument,
  UpdateProfileSkillDocument,
  UserDocument,
  type UserQuery,
} from "@/gql/generated/graphql";
import { usePermissions } from "@/lib/auth/permissions";
import { useSkillsCatalog } from "@/lib/skills/use-skills-catalog";
import { useSkillMutations } from "@/lib/skills/use-skill-mutations";

type ProfileSkill = NonNullable<UserQuery["user"]["profile"]["skills"]>[number];

export function useUserSkillsPage(userId: string, initialUser: UserQuery["user"] | null = null) {
  const { canEdit } = usePermissions(userId);
  const {
    groupSkillsByCategory,
    availableSkills: getAvailableSkills,
    skillCategoryMap,
  } = useSkillsCatalog();

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
  const canMutate = canEdit;

  const profileSkills = useMemo(() => user?.profile?.skills ?? [], [user]);

  const skillsByCategory = useMemo(
    () => groupSkillsByCategory(profileSkills),
    [groupSkillsByCategory, profileSkills],
  );
  const availableSkills = useMemo(
    () => getAvailableSkills(profileSkills),
    [getAvailableSkills, profileSkills],
  );

  const [removeMode, setRemoveMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateSkillTarget, setUpdateSkillTarget] = useState<ProfileSkill | null>(null);

  const toggleSkillSelection = useCallback((skillName: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillName)) next.delete(skillName);
      else next.add(skillName);
      return next;
    });
  }, []);

  const enterRemoveMode = useCallback(() => {
    setRemoveMode(true);
    setSelectedSkills(new Set());
  }, []);

  const cancelRemove = useCallback(() => {
    setRemoveMode(false);
    setSelectedSkills(new Set());
  }, []);

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
  }, [deleteSkills, selectedSkills]);

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
