"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import type { DisputeMessage } from "@/components/system-admin/dispute-management/types";

interface MessagesTabProps {
  messages: DisputeMessage[];
}

const roleColors: Record<string, string> = {
  renter: "bg-blue-500",
  company: "bg-purple-500",
  p2p_host: "bg-teal-500",
  platform: "bg-gray-500",
  admin: "bg-primary",
};

const roleLabels: Record<string, string> = {
  renter: "Renter",
  company: "Company",
  p2p_host: "P2P Host",
  platform: "Platform",
  admin: "Admin",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MessagesTab({ messages }: MessagesTabProps) {
  if (messages.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-14 text-center text-muted-foreground">
          No messages yet on this case.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg) => {
        const isInternal = msg.isInternal;
        const initials = getInitials(msg.author);
        const color = roleColors[msg.authorRole] ?? "bg-gray-400";
        const roleLabel = roleLabels[msg.authorRole] ?? msg.authorRole;

        return (
          <Card
            key={msg.id}
            className={cn(
              "shadow-sm transition-colors",
              isInternal &&
                "border-dashed bg-amber-50/60 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800"
            )}
          >
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback
                      className={cn("text-white text-xs", color)}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">
                        {msg.author}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 h-4 font-normal"
                      >
                        {roleLabel}
                      </Badge>
                      {isInternal && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          <Lock className="h-3 w-3" /> Internal note
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm leading-relaxed text-foreground/90">
                {msg.content}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
