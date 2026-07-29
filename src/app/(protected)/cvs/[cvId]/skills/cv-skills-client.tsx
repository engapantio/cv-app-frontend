"use client";

import { Trash2 } from "lucide-react";
import { useCvSkillsPage } from "@/features/cvs-skills/hooks/use-cv-skills-page";
import { MASTERY_MAP } from "@/features/cvs-skills/utils/mastery-mapping";
import { AddSkillDialog } from "@/features/cvs-skills/components/add-skill-dialog";
import { UpdateSkillDialog } from "@/features/cvs-skills/components/update-skill-dialog";
import { Button } from "@/components/ui";
import type { Mastery } from "@/gql/generated/graphql";

export function CvSkillsClient({ cvId }: { cvId: string }) {
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
  } = useCvSkillsPage(cvId);

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Loading...</div>;
  }

  if (skillsByCategory.length === 0) {
    return (
      <div className="mx-auto w-full max-w-225">
        <div className="text-center text-muted-foreground py-8">No skills assigned yet.</div>
        {canMutate && (
          <div className="flex justify-end items-center gap-6 pl-10 pr-6 py-4">
            <button
              type="button"
              onClick={() => setAddDialogOpen(true)}
              className="uppercase text-base font-medium bg-transparent border-none cursor-pointer"
              style={{ color: "#767676" }}
            >
              + ADD SKILL
            </button>
          </div>
        )}
        <AddSkillDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          availableSkills={availableSkills}
          onConfirm={handleAddSkill}
          loading={addingSkill}
        />
      </div>
    );
  }

  return (
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
                return (
                  <div key={skill.name} className="flex items-center gap-4 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (!removeMode && canMutate) {
                          setUpdateSkillTarget(skill);
                        }
                      }}
                      className={
                        "w-28.25 md:w-24 min-[1440px]:w-19.75 p-0 bg-transparent border-none shrink-0 " +
                        (!canMutate || removeMode ? "cursor-default " : "cursor-pointer ")
                      }
                      disabled={!canMutate || removeMode}
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
                        if (removeMode && canMutate) {
                          toggleSkillSelection(skill.name);
                        }
                      }}
                      className={
                        "text-base leading-none bg-transparent border-none p-0 text-left truncate " +
                        (removeMode && canMutate ? "cursor-pointer " : "cursor-default ") +
                        (isSelected ? "text-black dark:text-white " : "text-[#767676] ")
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
                className="uppercase text-base font-medium bg-transparent border-none cursor-pointer"
                style={{ color: "#767676" }}
              >
                + ADD SKILL
              </button>
              <button
                type="button"
                onClick={enterRemoveMode}
                className="uppercase text-base font-medium inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
                style={{ color: "#C63031" }}
              >
                <Trash2 className="h-4 w-4" />
                REMOVE SKILL
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={cancelRemove}
                className="uppercase text-base font-medium text-foreground bg-transparent border border-border rounded-[40px] min-w-30 py-2 cursor-pointer"
              >
                CANCEL
              </button>
              <Button
                type="button"
                onClick={handleDeleteSkills}
                disabled={selectedSkills.size === 0 || deletingSkill}
                className="uppercase text-white min-w-30 py-1.5"
                style={{ backgroundColor: "#e53935" }}
              >
                DELETE
                {selectedSkills.size > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-[#e53935] bg-white border border-white">
                    {selectedSkills.size}
                  </span>
                )}
              </Button>
            </>
          )}
        </div>
      )}

      <AddSkillDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        availableSkills={availableSkills}
        onConfirm={handleAddSkill}
        loading={addingSkill}
      />

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
}
