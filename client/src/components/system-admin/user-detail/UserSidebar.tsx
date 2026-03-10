"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  MoreVertical,
  Briefcase,
  ShieldAlert,
  Edit,
  UserCircle,
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
      "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
  },
  invited: {
    label: "Invited",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  },
  inactive: {
    label: "Inactive",
    icon: Ban,
    color: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800",
  },
  suspended: {
    label: "Suspended",
    icon: ShieldAlert,
    color: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
  },
};

export function UserSidebar({
  user,
  onStatusChange,
  onDelete,
}: UserSidebarProps) {
  const status = statusConfig[user.status];
  const StatusIcon = status.icon;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card className="shadow-sm sticky top-24 overflow-hidden border-t-4 border-t-primary">
      <div className="absolute top-4 right-4">
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
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusChange("active")}>
              Mark as Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("inactive")}>
              Mark as Inactive
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

      <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-muted-foreground/30 to-muted flex items-center justify-center shadow-lg mb-4 text-foreground text-3xl font-semibold border-2 border-background">
          {initials}
        </div>

        {/* Identity */}
        <h2 className="text-xl font-bold tracking-tight mb-1">{user.name}</h2>
        <p className="text-sm font-medium text-muted-foreground mb-3">
          @{user.username}
        </p>

        {/* Status Badge */}
        <Badge
          variant="outline"
          className={cn("mb-2 border-0 gap-1", status.color)}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </Badge>
        <Badge variant="secondary" className="font-normal capitalize mt-1">
          {user.role}
        </Badge>

        <div className="w-full border-t border-muted my-6" />

        {/* Contact & Meta Info */}
        <div className="flex flex-col gap-3 w-full text-left">
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{user.department}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">Manager: {user.manager || "N/A"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>Joined {new Date(user.joined).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="w-full border-t border-muted my-6" />

        {/* Admin Quick Facts */}
        <div className="flex flex-col gap-2 w-full text-left">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Last Login
          </span>
          <span className="text-sm">
            {user.lastLogin === "Never"
              ? "Never logged in"
              : new Date(user.lastLogin).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
