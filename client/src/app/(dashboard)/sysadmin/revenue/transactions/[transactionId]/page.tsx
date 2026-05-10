import { TransactionDetailPage } from "@/components/system-admin/revenue/TransactionDetailPage";

export default async function SysadminTransactionDetailRoute({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;

  return <TransactionDetailPage transactionId={transactionId} />;
}
