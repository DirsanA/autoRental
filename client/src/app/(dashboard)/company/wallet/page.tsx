import { WalletPage } from "@/components/shared/wallet/WalletPage";

export default function CompanyWalletPage() {
  return (
    <WalletPage
      title="Wallet"
      ownerType="Company"
      payoutRedirectPath="/company/wallet"
    />
  );
}

