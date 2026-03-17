import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CompanyStatus } from "./data";
import { CheckCircle2, Clock, Ban, AlertCircle } from "lucide-react";

const statusConfig: Record<
  CompanyStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    className:
      "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
  suspended: {
    label: "Suspended",
    icon: Ban,
    className:
      "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  expired: {
    label: "Expired",
    icon: AlertCircle,
    className:
      "bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
  },
};

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
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
