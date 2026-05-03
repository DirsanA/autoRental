"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Chrome } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import googleLogo from "@/assets/Google-logo.svg";

type AuthType = "login" | "signup";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: AuthType;
}

export function AuthModal({
  open,
  onOpenChange,
  defaultType = "login",
}: Props) {
  const [type, setType] = useState<AuthType>(defaultType);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay blocks whole page */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

        {/* Centered modal */}
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 overflow-hidden">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                {type === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {type === "login"
                  ? "Login to continue your journey"
                  : "Join Auto-rent today"}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 rounded-xl h-11 border border-gray-300 hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800 transition"
              onClick={() => {
                signIn("google"); 
                onOpenChange(false);
              }}
            >
              <Image
                src={googleLogo}
                alt="Google logo"
                className="w-5 h-5"
              />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-3 text-muted-foreground"
                />
                <Input
                  placeholder="Email address"
                  className="pl-9 h-11 rounded-xl"
                />
              </div>

              {type === "login" && (
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-3 text-muted-foreground"
                  />
                  <Input
                    placeholder="Phone number"
                    className="pl-9 h-11 rounded-xl"
                  />
                </div>
              )}

              {type === "signup" && (
                <Input placeholder="Full name" className="h-11 rounded-xl" />
              )}

              <Button className="w-full rounded-xl h-11 bg-primary text-white">
                {type === "login" ? "Login" : "Sign Up"}
              </Button>
            </div>

            {/* Switch */}
            <div className="text-center text-sm">
              {type === "login" ? (
                <>
                  Don’t have an account?{" "}
                  <span
                    className="text-primary font-semibold cursor-pointer"
                    onClick={() => setType("signup")}
                  >
                    Sign up
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    className="text-primary font-semibold cursor-pointer"
                    onClick={() => setType("login")}
                  >
                    Login
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Close button */}
          <Dialog.Close className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
            ✕
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
