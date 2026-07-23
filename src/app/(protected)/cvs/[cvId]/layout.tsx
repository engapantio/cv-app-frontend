import { CvLayoutClient } from "./cv-layout-client";

export default async function CvLayout({
  params,
  children,
}: {
  params: Promise<{ cvId: string }>;
  children: React.ReactNode;
}) {
  const { cvId } = await params;
  return <CvLayoutClient cvId={cvId}>{children}</CvLayoutClient>;
}
