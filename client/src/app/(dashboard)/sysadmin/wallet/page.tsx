import { WalletPage } from "@/components/shared/wallet/WalletPage";

export default function SystemAdminWalletPage() {
  return (
    <WalletPage
      title="System Wallet"
      ownerType="User"
      payoutRedirectPath="/sysadmin/wallet"
      showEscrowBalance
      description="Track withdrawable platform commission separately from security deposits currently held in escrow."
    />
  );
}
