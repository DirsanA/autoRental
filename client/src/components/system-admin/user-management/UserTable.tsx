import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Ban,
  CheckCircle2,
  Eye,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { User } from "./data";
import { cn } from "@/lib/utils";

interface UserTableProps {
  users: User[];
  pendingUserId?: string | null;
  onView: (user: User) => void;
  onActivate: (user: User) => void;
  onMarkPending: (user: User) => void;
  onSuspend: (user: User) => void;
  onDelete: (user: User) => void;
}

/**
 * Renders the admin user list table.
 */
export function UserTable({
  users,
  pendingUserId,
  onView,
  onActivate,
  onMarkPending,
  onSuspend,
  onDelete,
}: UserTableProps) {
  const formatDate = (dateString: string) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Unknown";

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];

    return colors[name.charCodeAt(0) % colors.length];
  };

  const getAccountTypeLabel = (user: User) =>
    user.accountType === "ADMIN"
      ? "Admin"
      : user.accountType === "USER"
        ? "User"
        : "Unknown";

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[280px]">User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Account Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[72px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-14 text-center text-muted-foreground"
              >
                No users found for the current filters.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isBusy = pendingUserId === user.id;

              return (
                <TableRow
                  key={user.id}
                  className="group transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarFallback
                          className={cn("text-white", getAvatarColor(user.name))}
                        >
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="font-medium">{user.name}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>@{user.username}</span>
                          <span>/</span>
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="inline-block rounded-md bg-muted/50 px-2 py-1 font-mono text-sm">
                      {user.role}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {getAccountTypeLabel(user)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.joined)}
                  </TableCell>

                  <TableCell className="text-right">
                    {isBusy ? (
                      <div className="flex justify-end">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-70 transition-opacity group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onView(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>

                          {user.status !== "active" && (
                            <DropdownMenuItem onClick={() => onActivate(user)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark active
                            </DropdownMenuItem>
                          )}

                          {user.status !== "inactive" &&
                            user.status !== "invited" && (
                              <DropdownMenuItem
                                onClick={() => onMarkPending(user)}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Move to pending
                              </DropdownMenuItem>
                            )}

                          {user.status !== "suspended" && (
                            <DropdownMenuItem onClick={() => onSuspend(user)}>
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => onDelete(user)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
