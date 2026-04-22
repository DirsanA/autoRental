import P2PHostDetailPageClient from "@/components/system-admin/p2p-detail/P2PHostDetailPageClient";

interface PageProps {
  params: Promise<{
    hostId: string;
  }>;
}

export const metadata = {
  title: "P2P Host Details | System Admin",
  description: "Review host verification, listings, and documents.",
};

export default async function P2PHostDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return <P2PHostDetailPageClient hostId={resolvedParams.hostId} />;
}
