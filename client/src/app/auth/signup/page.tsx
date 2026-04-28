"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Car, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import carImage from "@/assets/image.jpg";
import { registerUser } from "@/lib/auth-api";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
 const [fieldErrors, setFieldErrors] = useState<{
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
}>({});


  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const data = await registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      toast({
        title: "Account created",
        description:
          data?.message ||
          "Please check your email to verify your account before logging in.",
      });
      router.push("/auth/signin");
    } catch (err: unknown) {
      let errorMessage = "Please fix the highlighted fields";

      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          const backendMessage = parsed?.error?.message || "Registration failed";
          const details = parsed?.error?.details;
          errorMessage = backendMessage;

          if (Array.isArray(details)) {
            const mappedErrors: Record<string, string> = {};

            details.forEach((item: { field: string; message: string }) => {
              mappedErrors[item.field] = item.message;
            });

            setFieldErrors(mappedErrors);
            setError(backendMessage);
          } else {
            setError(backendMessage);
          }
        } catch {
          errorMessage = err.message;
          setError(err.message);
        }
      } else {
        errorMessage = "Registration failed";
        setError("Registration failed");
      }

      toast({
        title: "Registration failed",
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
        href="/auth/signin"
        className="absolute right-6 top-6 z-10 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        Login
      </Link>

      <div className="flex w-full items-center justify-center bg-background px-6 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Create an account
            </h1>
            <p className="text-muted-foreground">
              Start your premium car rental journey
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      firstName: undefined,
                    }));
                  }}
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {fieldErrors.firstName && (
                <p className="text-sm text-red-500">{fieldErrors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      lastName: undefined,
                    }));
                  }}
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {fieldErrors.lastName && (
                <p className="text-sm text-red-500">{fieldErrors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="0911234567 or +251911234567"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      phoneNumber: undefined,
                    }));
                  }}
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
             {fieldErrors.phoneNumber && (
  <p className="text-sm text-red-500">{fieldErrors.phoneNumber}</p>
)}

            </div>

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
              {submitting ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

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
              Build modern web applications and scale your ideas faster.
            </blockquote>
            <p className="text-sm font-medium text-white/70">
              CarRental Community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
