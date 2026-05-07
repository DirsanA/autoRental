"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Car, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import carImage from "@/assets/image.jpg";
import { requestPasswordReset } from "@/lib/auth-api";
import { useToast } from "@/hooks/use-toast";

function ForgotPasswordContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setSent(true);
      toast({
        title: "Email sent",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (err: unknown) {
      let errorMessage = "Failed to send reset email";

      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          errorMessage = parsed?.error?.message || "Failed to send reset email";
        } catch {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      toast({
        title: "Request failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="relative flex min-h-screen">
        <div className="relative hidden w-1/2 lg:block">
          <Image
            src={carImage}
            alt="Luxury car"
            className="h-full w-full object-cover"
            fill
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="absolute inset-0 flex flex-col justify-between p-10">
            <div className="flex items-center gap-2 text-xl font-bold text-white">
              <Car className="h-6 w-6" />
              CarRental
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-background px-6 lg:w-1/2">
          <div className="w-full max-w-md space-y-8">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Check your email
              </h1>
              <p className="text-muted-foreground">
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
                Click the link to reset your password.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => router.push("/auth/signin")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen">
      <Link
        href="/auth/signin"
        className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sign In
      </Link>

      <div className="relative hidden w-1/2 lg:block">
        <Image
          src={carImage}
          alt="Luxury car"
          className="h-full w-full object-cover"
          fill
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <Car className="h-6 w-6" />
            CarRental
          </div>
          <div className="space-y-4">
            <blockquote className="border-l-2 border-primary pl-4 text-lg italic text-white/90">
              Premium vehicles at your fingertips. Experience the road like
              never before.
            </blockquote>
            <p className="text-sm font-medium text-white/70">
              CarRental Community
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-background px-6 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Forgot password?
            </h1>
            <p className="text-muted-foreground">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
