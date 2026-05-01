"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VerifyEmailResultProps {
  title: string;
  description: string;
  redirectTo?: string;
  redirectDelay?: number;
}

export function VerifyEmailResult({
  title,
  description,
  redirectTo = "/auth/signin",
  redirectDelay = 3,
}: VerifyEmailResultProps) {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(redirectDelay);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const error = searchParams.get("error");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRedirecting(true);
          window.location.href = redirectTo;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectTo]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {error ? (
              <AlertCircle className="h-8 w-8 text-destructive" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {error ? "Verification Failed" : title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            {error
              ? typeof error === "string"
                ? decodeURIComponent(error)
                : "An error occurred during email verification. Please try again or contact support."
              : description}
          </p>

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href={redirectTo}>
                Go to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {!error && (
              <p className="text-xs text-muted-foreground">
                Redirecting to sign in in {countdown} second
                {countdown !== 1 ? "s" : ""}...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
