"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatProvider } from "@/components/providers/chat-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ChatProvider>
        {children}
      </ChatProvider>
    </ThemeProvider>
  );
}
