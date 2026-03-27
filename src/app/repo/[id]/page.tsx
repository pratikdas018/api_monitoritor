import { notFound, redirect } from "next/navigation";

import { RepoScanPanel } from "@/components/repos/RepoScanPanel";
import { getScannedFilesForRepository, getRepositoryForUser } from "@/lib/repositoryService";
import { getSessionUserId } from "@/lib/serverSession";

type RepoDetailPageProps = {
  params: { id: string };
};

export default async function RepoDetailPage({ params }: RepoDetailPageProps) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect(`/login?next=/repo/${params.id}`);
  }

  const repository = await getRepositoryForUser(userId, params.id);
  if (!repository) {
    notFound();
  }

  const scannedFiles = await getScannedFilesForRepository(userId, String(repository._id), 120);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1300px] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <RepoScanPanel
        repositoryId={String(repository._id)}
        fullName={repository.fullName}
        initialScannedFiles={scannedFiles.map((file) => ({
          _id: String(file._id),
          path: file.path,
          snippet: file.snippet,
          matchedBy: file.matchedBy,
          relevanceScore: file.relevanceScore,
          language: file.language,
        }))}
      />
    </main>
  );
}
