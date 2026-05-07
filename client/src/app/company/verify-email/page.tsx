import { Suspense } from "react";
import { VerifyEmailResult } from "@/components/auth/verify-email-result";

export default function CompanyVerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailResult
        title="Company Email Verified"
        description="Your company email has been verified. Sign in to continue to your company dashboard and manage your fleet."
        redirectTo="/auth/signin"
        redirectDelay={3}
      />
    </Suspense>
  );
}
