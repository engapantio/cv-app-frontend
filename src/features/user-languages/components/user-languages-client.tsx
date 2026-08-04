"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  LanguagesDocument,
  AddProfileLanguageDocument,
  UpdateProfileLanguageDocument,
  DeleteProfileLanguageDocument,
  UserDocument,
  type UserQuery,
  type Proficiency,
} from "@/gql/generated/graphql";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { usePermissions } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";
import { PROFICIENCY_MAP } from "../utils/proficiency-mapping";

const AddLanguageDialog = dynamic(
  () => import("./add-language-dialog").then((m) => m.AddLanguageDialog),
  { loading: () => null },
);
const UpdateLanguageDialog = dynamic(
  () => import("./update-language-dialog").then((m) => m.UpdateLanguageDialog),
  { loading: () => null },
);

type User = NonNullable<UserQuery["user"]>;
type Language = NonNullable<User["profile"]["languages"]>[number];

interface UserLanguagesClientProps {
  userId: string;
  isOwner: boolean;
}

export function UserLanguagesClient({ userId, isOwner }: UserLanguagesClientProps) {
  const { data, loading } = useQuery(UserDocument, {
    variables: { userId },
    fetchPolicy: "cache-and-network",
  });

  const user = data?.user;
  const languages = user?.profile?.languages || [];

  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);

  const { data: allLanguagesData } = useQuery(LanguagesDocument);
  const allLanguages = (allLanguagesData?.languages || []).filter(
    (l): l is NonNullable<typeof l> => l !== null,
  );

  const [addLanguage, { loading: adding }] = useMutation(AddProfileLanguageDocument, {
    refetchQueries: [{ query: UserDocument, variables: { userId } }],
  });
  const [updateLanguage, { loading: updating }] = useMutation(UpdateProfileLanguageDocument, {
    refetchQueries: [{ query: UserDocument, variables: { userId } }],
  });
  const [deleteLanguages, { loading: deleting }] = useMutation(DeleteProfileLanguageDocument, {
    refetchQueries: [{ query: UserDocument, variables: { userId } }],
  });

  const availableLanguages = allLanguages.filter(
    (lang) => !languages.some((ul) => ul.name === lang.name),
  );

  const { isAdmin } = usePermissions(userId);
  const canEdit = isOwner || isAdmin;

  const handleAddLanguage = async (languageName: string, proficiency: Proficiency) => {
    await addLanguage({
      variables: {
        language: {
          userId,
          name: languageName,
          proficiency,
        },
      },
    });
    toast.success("Language added successfully");
  };

  const handleUpdateLanguage = async (name: string, proficiency: Proficiency) => {
    await updateLanguage({
      variables: {
        language: {
          userId,
          name,
          proficiency,
        },
      },
    });
    toast.success("Language updated successfully");
  };

  const handleDeleteLanguages = async () => {
    if (selectedLanguages.length === 0) return;
    await deleteLanguages({
      variables: {
        language: {
          userId,
          name: selectedLanguages,
        },
      },
    });
    toast.success("Languages deleted successfully");
    setSelectedLanguages([]);
    setIsRemoving(false);
  };

  const toggleLanguageSelection = (name: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const openUpdateDialog = (lang: Language) => {
    setCurrentLanguage(lang);
    setUpdateDialogOpen(true);
  };

  if (loading) return <div className="text-center text-muted-foreground py-8">Loading...</div>;

  return (
    <div className="mx-auto w-full max-w-225">
      <h2 className="text-base text-foreground/70">Languages</h2>
      {languages.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No languages assigned yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-30 gap-y-11 pl-45 pr-6 pt-8 pb-14">
          {languages.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.name);
            return (
              <div key={lang.name} className="flex items-center min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (!isRemoving && canEdit) {
                      openUpdateDialog(lang);
                    }
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-between bg-transparent border-none p-0 text-left truncate",
                    !canEdit || isRemoving ? "cursor-default" : "cursor-pointer",
                    isSelected ? "text-black dark:text-white" : "text-foreground/70",
                  )}
                >
                  <span
                    className="w-20 shrink-0"
                    style={{ color: PROFICIENCY_MAP[lang.proficiency]?.color || "#767676" }}
                  >
                    {lang.proficiency}
                  </span>
                  <span>{lang.name}</span>
                </button>
                {isRemoving && canEdit && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleLanguageSelection(lang.name)}
                    className="ml-3 shrink-0"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {canEdit && (
        <div className="flex justify-end items-center gap-6 pl-10 pr-6 py-4">
          {!isRemoving ? (
            <>
              <button
                type="button"
                onClick={() => setAddDialogOpen(true)}
                className="uppercase text-base font-medium bg-transparent border-none cursor-pointer"
                style={{ color: "#767676" }}
              >
                + ADD LANGUAGE
              </button>
              <button
                type="button"
                onClick={() => setIsRemoving(true)}
                className="uppercase text-base font-medium inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
                style={{ color: "#C63031" }}
              >
                <Trash2 className="h-4 w-4" />
                REMOVE LANGUAGES
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsRemoving(false);
                  setSelectedLanguages([]);
                }}
                className="uppercase text-base font-medium text-foreground bg-transparent border border-border rounded-[40px] min-w-30 py-2 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleDeleteLanguages}
                disabled={selectedLanguages.length === 0 || deleting}
                className="uppercase text-white min-w-30 py-1.5 inline-flex items-center justify-center gap-1"
                style={{
                  backgroundColor: "#e53935",
                  borderRadius: "40px",
                  border: "none",
                  padding: "0.5rem 1rem",
                  cursor: selectedLanguages.length === 0 || deleting ? "default" : "pointer",
                  opacity: selectedLanguages.length === 0 || deleting ? 0.5 : 1,
                }}
              >
                DELETE
                {selectedLanguages.length > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-[#e53935] bg-white border border-white">
                    {selectedLanguages.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {addDialogOpen && (
        <AddLanguageDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          availableLanguages={availableLanguages}
          onConfirm={handleAddLanguage}
          loading={adding}
        />
      )}

      {updateDialogOpen && currentLanguage && (
        <UpdateLanguageDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          currentLanguage={currentLanguage}
          onConfirm={handleUpdateLanguage}
          loading={updating}
        />
      )}
    </div>
  );
}
