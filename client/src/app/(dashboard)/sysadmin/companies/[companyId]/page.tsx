import CompanyDetailPage from "@/components/system-admin/company-detail/CompanyDetailPage";

export const metadata = {
  title: "Company Details | System Admin",
  description: "View and manage complete company information.",
};

interface PageProps {
  params: Promise<{
    companyId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;

  return <CompanyDetailPage companyId={resolvedParams.companyId} />;
}
