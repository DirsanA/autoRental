import { WalletPage } from "@/components/shared/wallet/WalletPage";

export default function RenterWalletPage() {
  return (
    <WalletPage
      title="Wallet"
      ownerType="User"
      payoutRedirectPath="/renter/wallet"
      description="Track held security deposits in escrow, see refunded balance, and withdraw available renter funds through Chapa."
    />
  );
}
