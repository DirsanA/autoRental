import { ReportDetailPage } from "@/components/system-admin/report-management/ReportDetailPage";

export const metadata = {
  title: "Report Detail | System Admin",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportDetailPage id={id} />;
}
