"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Car, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import carImage from "@/assets/image.jpg";
import { fetchCurrentSession, loginWithEmail } from "@/lib/auth-api";
import { writeAuthToken } from "@/lib/auth-token";
import { buildUserRoleState, writeUserRoleState } from "@/lib/role-store";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

type PortalType = "user" | "company" | "admin";

function getPortalFromQuery(value: string | null): PortalType {
  if (value === "company" || value === "admin") return value;
  return "user";
}

function getDefaultDestination(portal: PortalType) {
  if (portal === "company") return "/company/dashboard";
  if (portal === "admin") return "/sysadmin/dashboard";
  return "/renter/dashboard";
}

function getSafeNextPath(next: string | null, fallback: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  return next;
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const portal = getPortalFromQuery(searchParams.get("portal"));
  const nextPath = getSafeNextPath(
    searchParams.get("next"),
    getDefaultDestination(portal),
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const data = await loginWithEmail({
        email: email.trim().toLowerCase(),
        password,
        portal,
      });
      writeAuthToken(data.token || null);
      const session = await fetchCurrentSession().catch(() => null);
      writeUserRoleState(
        buildUserRoleState(session || (data.user as Record<string, unknown>)),
      );
      toast({
        title: "Signed in",
        description: data.message || "Login successful",
      });

      router.push(nextPath);
    } catch (err: unknown) {
      let errorMessage = "Login failed";

      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          const backendMessage = parsed?.error?.message || "Login failed";
          const details = parsed?.error?.details;

          errorMessage = backendMessage;

          if (Array.isArray(details)) {
            const mappedErrors: Record<string, string> = {};

            details.forEach((item: { field: string; message: string }) => {
              mappedErrors[item.field] = item.message;
            });

            setFieldErrors(mappedErrors);
          }

          setError(backendMessage);
        } catch {
          errorMessage = err.message;
          setError(err.message);
        }
      } else {
        setError("Login failed");
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen">
      <Link
        href="/auth/signup"
        className="absolute right-6 top-6 z-10 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        Register
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
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              {portal === "company"
                ? "Sign in to manage your company bookings and fleet"
                : portal === "admin"
                  ? "Sign in to manage the admin portal"
                  : "Sign in to manage your rentals"}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                  }}
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
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
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
