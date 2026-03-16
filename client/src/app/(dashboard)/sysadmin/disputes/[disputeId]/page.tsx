import { DisputeDetailPage } from "@/components/system-admin/dispute-detail/DisputeDetailPage";

export const metadata = {
  title: "Dispute Detail | System Admin",
  description: "View and resolve specific dispute cases.",
};

interface PageProps {
  params: Promise<{
    disputeId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <DisputeDetailPage disputeId={resolvedParams.disputeId} />;
}
