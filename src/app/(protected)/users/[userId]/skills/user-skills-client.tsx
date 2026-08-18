"use client";

import dynamic from "next/dynamic";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUserSkillsPage } from "@/features/user-skills/hooks/use-user-skills-page";
import { MASTERY_MAP } from "@/features/cvs-skills/utils/mastery-mapping";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Mastery, UserQuery } from "@/gql/generated/graphql";
import type { SkillsCatalogInitial } from "@/lib/skills/group-skills";

const AddSkillDialog = dynamic(
  () => import("@/features/cvs-skills/components/add-skill-dialog").then((m) => m.AddSkillDialog),
  { loading: () => null },
);
const UpdateSkillDialog = dynamic(
  () =>
    import("@/features/cvs-skills/components/update-skill-dialog").then((m) => m.UpdateSkillDialog),
  { loading: () => null },
);

type User = NonNullable<UserQuery["user"]>;

export function UserSkillsClient({
  userId,
  initialUser,
  skillsCatalog,
}: {
  userId: string;
  initialUser: User | null;
  skillsCatalog: SkillsCatalogInitial;
}) {
  const t = useTranslations();
  const {
    loading,
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
  } = useUserSkillsPage(userId, initialUser, skillsCatalog);

  const content =
    skillsByCategory.length === 0 ? (
      <div className="mx-auto w-full max-w-225">
        <div className="text-center text-muted-foreground py-8">{t("common.noSkillsAssigned")}</div>
        {canMutate && (
          <div className="flex justify-end items-center gap-6 pl-10 pr-6 py-4">
            <button
              type="button"
              onClick={() => setAddDialogOpen(true)}
              className="uppercase text-base font-medium bg-transparent border-none cursor-pointer text-muted-solid"
            >
              + {t("buttons.addSkill")}
            </button>
          </div>
        )}
        {addDialogOpen && (
          <AddSkillDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            availableSkills={availableSkills}
            onConfirm={handleAddSkill}
            loading={addingSkill}
          />
        )}
      </div>
    ) : (
      <div className="mx-auto w-full max-w-225">
        <div>
          {skillsByCategory.map((category) => (
            <div key={category.categoryId}>
              <div className="text-base font-normal leading-normal pl-0 min-[1440px]:pl-6 pt-3 pb-1.5 text-foreground">
                {category.categoryName}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-11 pl-0 min-[1440px]:pl-10 pr-6 pt-8 pb-10.5">
                {category.skills.map((skill) => {
                  const config = MASTERY_MAP[skill.mastery as Mastery] ?? MASTERY_MAP.Novice;
                  const isSelected = selectedSkills.has(skill.name);
                  const barEditable = canMutate && !removeMode;
                  const nameRemovable = removeMode && canMutate;
                  return (
                    <div key={skill.name} className="flex items-center gap-4 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (barEditable) {
                            setUpdateSkillTarget(skill);
                          }
                        }}
                        className={
                          "w-28.25 md:w-24 min-[1440px]:w-19.75 p-0 bg-transparent border-none shrink-0 transition-opacity " +
                          (barEditable ? "cursor-pointer hover:opacity-80 " : "cursor-default ")
                        }
                        disabled={!barEditable}
                      >
                        <div
                          className="w-full rounded-sm"
                          style={{
                            height: 4,
                            backgroundColor:
                              removeMode && isSelected ? "rgb(59, 59, 59)" : config.track,
                          }}
                        >
                          <div
                            className="h-full rounded-sm"
                            style={{
                              width: removeMode && isSelected ? "100%" : `${config.percent}%`,
                              backgroundColor:
                                removeMode && isSelected ? "rgb(59, 59, 59)" : config.fill,
                            }}
                          />
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (nameRemovable) {
                            toggleSkillSelection(skill.name);
                          }
                        }}
                        className={
                          "text-base leading-none bg-transparent border-none p-0 text-left truncate transition-colors " +
                          (nameRemovable
                            ? "cursor-pointer hover:text-black dark:hover:text-white "
                            : "cursor-default ") +
                          (isSelected ? "text-black dark:text-white " : "text-muted-solid ")
                        }
                      >
                        {skill.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {canMutate && (
          <div className="flex justify-end items-center gap-6 pl-10 pr-6 py-4">
            {!removeMode ? (
              <>
                <button
                  type="button"
                  onClick={() => setAddDialogOpen(true)}
                  className="uppercase text-base font-medium bg-transparent border-none cursor-pointer text-muted-solid"
                >
                  + {t("buttons.addSkill")}
                </button>
                <button
                  type="button"
                  onClick={enterRemoveMode}
                  className="uppercase text-base font-medium inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-primary"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("buttons.removeSkills")}
                </button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancelRemove}
                  className="uppercase text-border min-w-30 border border-border rounded-[40px] py-2 h-auto"
                >
                  {t("buttons.cancel")}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDeleteSkills}
                  disabled={selectedSkills.size === 0 || deletingSkill}
                  className="uppercase min-w-30 py-1.5"
                >
                  {t("buttons.delete")}
                  {selectedSkills.size > 0 && <Badge variant="count">{selectedSkills.size}</Badge>}
                </Button>
              </>
            )}
          </div>
        )}

        {addDialogOpen && (
          <AddSkillDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            availableSkills={availableSkills}
            onConfirm={handleAddSkill}
            loading={addingSkill}
          />
        )}

        {updateSkillTarget && (
          <UpdateSkillDialog
            open={!!updateSkillTarget}
            onOpenChange={(open) => {
              if (!open) setUpdateSkillTarget(null);
            }}
            skillName={updateSkillTarget.name}
            currentMastery={updateSkillTarget.mastery as Mastery}
            onConfirm={handleUpdateSkill}
            loading={updatingSkill}
          />
        )}
      </div>
    );

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">{t("common.loading")}</div>;
  }

  return content;
}
