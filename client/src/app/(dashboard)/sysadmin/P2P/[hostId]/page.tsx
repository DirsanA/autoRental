import P2PHostDetailPage from "@/components/system-admin/p2p-detail/P2PHostDetailPage";

export const metadata = {
  title: "P2P Host Details | System Admin",
  description: "Review Host Verification, Listings, and Earnings.",
};

interface PageProps {
  params: Promise<{
    hostId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <P2PHostDetailPage hostId={resolvedParams.hostId} />;
}
