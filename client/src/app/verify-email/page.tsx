import { Suspense } from "react";
import { VerifyEmailResult } from "@/components/auth/verify-email-result";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailResult
        title="Email Verified"
        description="Your email has been verified successfully. Sign in to start renting vehicles and manage your bookings."
        redirectTo="/auth/signin"
        redirectDelay={5}
      />
    </Suspense>
  );
}
