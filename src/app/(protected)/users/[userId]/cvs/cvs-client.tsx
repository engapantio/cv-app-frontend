"use client";

import { type UserQuery } from "@/gql/generated/graphql";
import { CvsTable } from "@/features/cvs/components/cvs-table";
import { useCvsPage } from "@/features/cvs/hooks";
import { useTranslations } from "next-intl";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export default function UserCvsClient({
  userId,
  initialCvs,
  initialUserEmail,
  serverError,
}: {
  userId: string;
  initialCvs: CvItem[];
  initialUserEmail?: string | null;
  serverError?: string | null;
}) {
  const tableData = useCvsPage({ userId, initialCvs, initialUserEmail });
  const t = useTranslations("nav");

  return (
    <div className="flex w-full">
      <main className="flex-1">
        <div className="flex items-center h-11">
          <h1 className="text-base text-foreground/70">{t("cvs")}</h1>
        </div>
        <CvsTable
          {...tableData}
          serverError={serverError}
          createUserId={userId}
          tableClassName="table-fixed w-full [&_tr]:border-b-table-border [border-collapse:collapse]"
        />
      </main>
    </div>
  );
}
