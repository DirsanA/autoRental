import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserStatus } from "./data";
import { CheckCircle, Circle, Mail, Ban } from "lucide-react";

const statusConfig: Record<
  UserStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  active: {
    label: "Active",
    icon: CheckCircle,
    className:
      "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
  inactive: {
    label: "Inactive",
    icon: Circle,
    className:
      "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
  },
  invited: {
    label: "Invited",
    icon: Mail,
    className:
      "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  suspended: {
    label: "Suspended",
    icon: Ban,
    className:
      "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function StatusBadge({ status }: { status: UserStatus }) {
  const { label, icon: Icon, className } = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-normal border-0", className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
