"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button, Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { Camera, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { UploadAvatarDocument, DeleteAvatarDocument, UserDocument } from "@/gql/generated/graphql";
import { useMutation } from "@apollo/client/react";

interface AvatarUploadProps {
  userId: string;
  currentAvatar?: string | null;
  fullName: string;
  isOwner: boolean;
}

export function AvatarUpload({ userId, currentAvatar, fullName, isOwner }: AvatarUploadProps) {
  const t = useTranslations();
  const [uploadAvatar] = useMutation(UploadAvatarDocument, {
    refetchQueries: [{ query: UserDocument, variables: { userId } }],
  });
  const [deleteAvatar] = useMutation(DeleteAvatarDocument, {
    refetchQueries: [{ query: UserDocument, variables: { userId } }],
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error(t("common.avatarTooLarge"));
      return;
    }
    const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("common.avatarInvalidType"));
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await uploadAvatar({
        variables: {
          avatar: { userId, base64, size: file.size, type: file.type },
        },
      });
      toast.success(t("common.avatarUploadedSuccess"));
    } catch {
      toast.error(t("common.avatarUploadFailed"));
      setIsUploading(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAvatar) return;
    try {
      await deleteAvatar({ variables: { avatar: { userId } } });
      toast.success(t("common.avatarDeletedSuccess"));
    } catch {
      toast.error(t("common.avatarDeletedFailed"));
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const initial = fullName ? fullName[0].toUpperCase() : "?";

  return (
    <div className="flex items-center gap-10">
      <div className=" relative group">
        <Avatar className="size-30 cursor-pointer" onClick={isOwner ? triggerFileInput : undefined}>
          <AvatarImage src={currentAvatar || undefined} />
          <AvatarFallback className="text-3xl">{initial}</AvatarFallback>
        </Avatar>
        {isOwner && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={triggerFileInput}
          >
            <Camera className="h-8 w-8 text-white" />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      <div>
        {isOwner && (
          <div className="flex gap-1 items-center justify-center font-bold">
            <Button variant="ghost" size={"lg"} onClick={triggerFileInput} disabled={isUploading}>
              <Upload />
            </Button>
            {currentAvatar && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <div>{t("fields.avatar.upload")}</div>
          </div>
        )}
        <p className="text-base text-muted-foreground text-center max-w-50">
          {isOwner ? t("fields.avatar.sizeHint") : ""}
        </p>
      </div>
    </div>
  );
}
