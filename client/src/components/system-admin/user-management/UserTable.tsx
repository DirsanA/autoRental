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
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Ban, MailCheck } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { User } from "./data";
import { cn } from "@/lib/utils";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onSuspend: (user: User) => void;
  onDelete: (user: User) => void;
  onResendInvite?: (user: User) => void;
}

export function UserTable({
  users,
  onEdit,
  onSuspend,
  onDelete,
  onResendInvite,
}: UserTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Consistent avatar color based on name (for demo)
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[250px]">User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-12 text-muted-foreground"
              >
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className="group hover:bg-muted/50 transition-colors"
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
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <span>@{user.username}</span>
                        <span className="text-xs">•</span>
                        <span className="truncate max-w-[150px]">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-sm bg-muted/50 px-2 py-1 rounded-md inline-block">
                    {user.role}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(user.joined)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      {user.status !== "suspended" && (
                        <DropdownMenuItem onClick={() => onSuspend(user)}>
                          <Ban className="mr-2 h-4 w-4" /> Suspend
                        </DropdownMenuItem>
                      )}
                      {user.status === "invited" && onResendInvite && (
                        <DropdownMenuItem onClick={() => onResendInvite(user)}>
                          <MailCheck className="mr-2 h-4 w-4" /> Resend
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
