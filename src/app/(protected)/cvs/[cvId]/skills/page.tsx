import { CvSkillsClient } from "./cv-skills-client";

export default async function CvSkillsPage({ params }: { params: Promise<{ cvId: string }> }) {
  const { cvId } = await params;
  return <CvSkillsClient cvId={cvId} />;
}
