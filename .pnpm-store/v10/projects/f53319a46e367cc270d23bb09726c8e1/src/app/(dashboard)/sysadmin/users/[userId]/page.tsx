import { UserDetailPage } from "@/components/system-admin/user-detail/UserDetailPage";

export const metadata = {
  title: "User Profile | System Admin",
  description: "View full system user logs, details, and permissions.",
};

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <UserDetailPage userId={resolvedParams.userId} />;
}
