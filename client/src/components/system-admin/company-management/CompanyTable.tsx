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
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Ban,
  Eye,
  RefreshCcw,
  Users,
} from "lucide-react";
import { CompanyStatusBadge } from "./CompanyStatusBadge";
import { PlanBadge } from "./PlanBadge";
import { Company } from "./data";
import { cn } from "@/lib/utils";

// ─── Seat usage mini progress bar ────────────────────────────────────────────

function SeatUsageBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-primary";

  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {used}/{total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Avatar / Initials ────────────────────────────────────────────────────────

function CompanyAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "bg-violet-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-indigo-500",
    "bg-pink-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={cn(
        "h-9 w-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 border border-white/10 shadow-sm",
        color,
      )}
    >
      {initials}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface CompanyTableProps {
  companies: Company[];
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onSuspend: (company: Company) => void;
  onReactivate: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyTable({
  companies,
  onView,
  onEdit,
  onSuspend,
  onReactivate,
  onDelete,
}: CompanyTableProps) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[260px]">Company</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Seats</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {companies.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-16 text-muted-foreground"
              >
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-8 w-8 opacity-30" />
                  <span>No companies found.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            companies.map((co) => (
              <TableRow
                key={co.id}
                className="group hover:bg-muted/50 transition-colors"
              >
                {/* Company identity */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CompanyAvatar name={co.name} />
                    <div>
                      <div className="font-medium leading-tight">{co.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <span className="font-mono">/{co.slug}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="truncate max-w-[140px]">
                          {co.ownerEmail}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Plan */}
                <TableCell>
                  <PlanBadge plan={co.plan} />
                </TableCell>

                {/* Status */}
                <TableCell>
                  <CompanyStatusBadge status={co.status} />
                </TableCell>

                {/* Seats */}
                <TableCell>
                  <SeatUsageBar used={co.seatsUsed} total={co.seatsTotal} />
                </TableCell>

                {/* Country */}
                <TableCell className="text-sm text-muted-foreground">
                  {co.country}
                </TableCell>

                {/* Created */}
                <TableCell className="text-sm text-muted-foreground">
                  {fmt(co.createdAt)}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onView(co)}>
                        <Eye className="mr-2 h-4 w-4" /> View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(co)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      {co.status === "suspended" ? (
                        <DropdownMenuItem onClick={() => onReactivate(co)}>
                          <RefreshCcw className="mr-2 h-4 w-4" /> Reactivate
                        </DropdownMenuItem>
                      ) : (
                        co.status !== "expired" && (
                          <DropdownMenuItem onClick={() => onSuspend(co)}>
                            <Ban className="mr-2 h-4 w-4" /> Suspend
                          </DropdownMenuItem>
                        )
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(co)}
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
