import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CompanyPlan } from "./data";
import { Zap, Star, Rocket, Building2 } from "lucide-react";

const planConfig: Record<
  CompanyPlan,
  { label: string; icon: React.ElementType; className: string }
> = {
  free: {
    label: "Free",
    icon: Zap,
    className:
      "bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
  },
  starter: {
    label: "Starter",
    icon: Star,
    className:
      "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  growth: {
    label: "Growth",
    icon: Rocket,
    className:
      "bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  },
  enterprise: {
    label: "Enterprise",
    icon: Building2,
    className:
      "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

export function PlanBadge({ plan }: { plan: CompanyPlan }) {
  const { label, icon: Icon, className } = planConfig[plan];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-normal border-0 capitalize", className)}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
