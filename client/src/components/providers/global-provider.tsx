"use client";

import { useAuth } from "@/hooks/use_auth";
import { NotificationProvider } from "./notification-provider";
import { ChatProvider } from "./chat-provider";
import { ReactNode } from "react";

export function GlobalProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  // Derive IDs — only set once auth has finished loading to avoid
  // connecting the socket unauthenticated and never re-joining the right room.
  const userId   = !loading && user ? user.id : undefined;
  const adminId  = !loading && user?.accountType === "ADMIN" ? user.id : undefined;

  return (
    // Use the resolved userId as a key so that when auth loads and we get a
    // real user, the NotificationProvider remounts and joins the correct socket room.
    <NotificationProvider
      key={userId ?? "guest"}
      userId={userId}
      adminId={adminId}
    >
      <ChatProvider>
        {children}
      </ChatProvider>
    </NotificationProvider>
  );
}

