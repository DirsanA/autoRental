"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Car, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import carImage from "@/assets/image.jpg";
import { loginWithEmail, type LoginPortal } from "@/lib/auth-api";
import { writeAuthToken } from "@/lib/auth-token";
import { useToast } from "@/hooks/use-toast";

const SignIn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const nextUrl = searchParams.get("next") || "";

  const initialPortal = useMemo<LoginPortal>(() => {
    const p = (searchParams.get("portal") || "user").toLowerCase();
    if (p === "admin" || p === "company" || p === "user") return p;
    return "user";
  }, [searchParams]);

  const [portal, setPortal] = useState<LoginPortal>(initialPortal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portalRedirect = (p: LoginPortal) => {
    if (nextUrl) return nextUrl;
    if (p === "admin") return "/sysadmin/dashboard";
    if (p === "company") return "/company/dashboard";
    return "/renter/dashboard";
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data = await loginWithEmail(portal, {
        email: email.trim().toLowerCase(),
        password,
      });
      writeAuthToken(data.token || null);
      toast({
        title: "Signed in",
        description: data.message || "Login successful",
      });
      router.push(portalRedirect(portal));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      toast({
        title: "Login failed",
        description: msg,
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
              Sign in to manage your rentals
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPortal("user")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                portal === "user"
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground hover:bg-accent"
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setPortal("company")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                portal === "company"
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground hover:bg-accent"
              }`}
            >
              Company
            </button>
            <button
              type="button"
              onClick={() => setPortal("admin")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                portal === "admin"
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground hover:bg-accent"
              }`}
            >
              Admin
            </button>
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
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
};

export default SignIn;
