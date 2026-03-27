"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MoreVertical,
  Phone,
  ShieldAlert,
  UserCircle,
  Wallet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserFullDetail, UserStatus } from "./types";

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
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
  invited: {
    label: "Invited",
    icon: Clock,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  inactive: {
    label: "Inactive",
    icon: Ban,
    color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  suspended: {
    label: "Suspended",
    icon: ShieldAlert,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
};

/**
 * Renders the admin user detail sidebar.
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

  return (
    <Card className="sticky top-24 overflow-hidden border-t-4 border-t-primary shadow-sm">
      <div className="absolute right-4 top-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
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

      <CardContent className="flex flex-col items-center pb-6 pt-8 text-center">
        <Avatar className="mb-4 h-24 w-24 border-2 border-background shadow-lg">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-tr from-muted-foreground/30 to-muted text-3xl font-semibold text-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h2 className="mb-1 text-xl font-bold tracking-tight">{user.name}</h2>
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          @{user.username}
        </p>

        <Badge variant="outline" className={cn("mb-2 gap-1 border-0", status.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </Badge>

        <div className="mt-1 flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {user.role}
          </Badge>
          <Badge variant="secondary" className="font-normal">
            {user.accountType ? user.accountType.toLowerCase() : "unknown"}
          </Badge>
        </div>

        <div className="my-6 w-full border-t border-muted" />

        <div className="flex w-full flex-col gap-3 text-left">
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{user.email}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-foreground">
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{user.phoneNumber || "Phone not provided"}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-foreground">
            <ShieldAlert className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              Verification: {user.verificationLevel || "Not available"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-foreground">
            <UserCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>Email verified: {user.emailVerified ? "Yes" : "No"}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              Joined{" "}
              {user.joined ? new Date(user.joined).toLocaleDateString() : "Unknown"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-foreground">
            <Wallet className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              Wallet:{" "}
              {typeof user.walletBalance === "number"
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                  }).format(user.walletBalance)
                : "Not available"}
            </span>
          </div>
        </div>

        <div className="my-6 w-full border-t border-muted" />

        <div className="flex w-full flex-col gap-2 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Last Login
          </span>
          <span className="text-sm">
            {user.lastLogin
              ? new Date(user.lastLogin).toLocaleString()
              : "Never logged in"}
          </span>
        </div>

        <div className="mt-6 flex w-full flex-wrap gap-2 text-left">
          {(user.roles.length > 0 ? user.roles : [user.role]).map((role) => (
            <Badge key={role} variant="outline" className="font-normal">
              {role}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
