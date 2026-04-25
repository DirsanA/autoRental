"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Ban,
  CheckCircle2,
  Clock,
  MoreVertical,
  ShieldAlert,
} from "lucide-react";
import type { UserFullDetail, UserStatus } from "./types";
import { formatLabel } from "./formatters";

interface UserSidebarProps {
  user: UserFullDetail;
  onStatusChange: (status: UserStatus) => void;
  onDelete: () => void;
}

const statusConfig: Record<
  UserStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  invited: {
    label: "Invited",
    icon: Clock,
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  },
  inactive: {
    label: "Inactive",
    icon: Ban,
    color: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  },
  suspended: {
    label: "Suspended",
    icon: ShieldAlert,
    color: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  },
};

/**
 * Renders the compact admin user summary sidebar.
 */
export function UserSidebar({
  user,
  onStatusChange,
  onDelete,
}: UserSidebarProps) {
  const status = statusConfig[user.status];
  const StatusIcon = status.icon;

  const initials = user.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roles = user.roles.length > 0 ? user.roles : [user.role];

  return (
    <Card className="sticky top-24 overflow-hidden border-none bg-gradient-to-b from-card via-card to-muted/20 shadow-sm ring-1 ring-border">
      <div className="absolute right-4 top-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onStatusChange("active")}>
              Mark as Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("inactive")}>
              Mark as Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("suspended")}>
              Suspend Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="h-24 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_55%),linear-gradient(135deg,rgba(15,23,42,0.06),rgba(15,23,42,0))]" />

      <CardContent className="-mt-12 flex flex-col gap-5 pb-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="mb-4 h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-tr from-slate-300 to-slate-100 text-3xl font-semibold text-slate-900">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-bold tracking-tight">{user.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge
              variant="outline"
              className={cn("gap-1 border-0", status.color)}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </Badge>
            <Badge variant="secondary" className="font-normal">
              {formatLabel(user.verificationLevel)}
            </Badge>
            <Badge variant="secondary" className="font-normal">
              {formatLabel(user.accountType)}
            </Badge>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Quick Actions
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange("active")}
              disabled={user.status === "active"}
              className="text-xs"
            >
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange("suspended")}
              disabled={user.status === "suspended"}
              className="text-xs"
            >
              Suspend
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
