import { WalletPage } from "@/components/shared/wallet/WalletPage";

export default function SystemAdminWalletPage() {
  return (
    <WalletPage
      title="System Wallet"
      ownerType="User"
      showEscrowBalance={false}
      description="Track platform commission balance and request system withdrawals."
    />
  );
}
