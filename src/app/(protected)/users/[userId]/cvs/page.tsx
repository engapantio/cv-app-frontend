import { fetchInitialRows } from "@/lib/apollo/initial-data";
import { UserDocument, type UserQuery } from "@/gql/generated/graphql";
import UserCvsClient from "./cvs-client";

type CvItem = NonNullable<UserQuery["user"]["cvs"]>[number];

export default async function UserCvsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const { initial, serverError, extra } = await fetchInitialRows<UserQuery, CvItem, string | null>({
    query: UserDocument,
    variables: { userId },
    getData: (data) => (data?.user?.cvs ?? []) as Array<CvItem | null>,
    errorMessage: "Failed to load CVs",
    select: (data) => data?.user?.email ?? null,
  });

  return (
    <UserCvsClient
      userId={userId}
      initialCvs={initial}
      initialUserEmail={extra}
      serverError={serverError}
    />
  );
}
