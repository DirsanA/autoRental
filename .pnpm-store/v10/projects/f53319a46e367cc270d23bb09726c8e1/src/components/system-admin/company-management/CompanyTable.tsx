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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CheckCircle2,
  Eye,
  Loader2,
  MoreHorizontal,
  ShieldBan,
} from "lucide-react";
import { CompanyStatusBadge } from "./CompanyStatusBadge";
import type { Company } from "./data";

interface CompanyTableProps {
  companies: Company[];
  pendingCompanyId?: string | null;
  onView: (company: Company) => void;
  onApprove: (company: Company) => void;
  onSuspend: (company: Company) => void;
}

function CompanyAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted font-semibold text-foreground">
      {initials}
    </div>
  );
}

/**
 * Renders the live company moderation directory for system admins.
 */
export function CompanyTable({
  companies,
  pendingCompanyId,
  onView,
  onApprove,
  onSuspend,
}: CompanyTableProps) {
  const formatDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Unknown";

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[280px]">Company</TableHead>
            <TableHead>Auth Account</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[72px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {companies.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-16 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center gap-2">
                  <Building2 className="h-8 w-8 opacity-30" />
                  <span>No companies found for the current filters.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => {
              const isBusy = pendingCompanyId === company.id;

              return (
                <TableRow
                  key={company.id}
                  className="group transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CompanyAvatar name={company.name} />
                      <div className="min-w-0">
                        <div className="font-medium">{company.name}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="truncate">
                            {company.contactEmail || "No contact email"}
                          </span>
                          <span>/</span>
                          <span>{company.tinNumber || "No TIN"}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {company.authAccount?.name || "No linked auth account"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {company.authAccount?.email ||
                          company.contactEmail ||
                          "No email"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {company.isVerified ? "Verified" : "Not verified"}
                      </Badge>
                      {company.website ? (
                        <Badge variant="outline" className="font-normal">
                          Website
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell>
                    <CompanyStatusBadge status={company.status} />
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(company.createdAt)}
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

                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onView(company)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          {company.statusValue !== "ACTIVE" ? (
                            <DropdownMenuItem
                              onClick={() => onApprove(company)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {company.statusValue === "SUSPENDED"
                                ? "Reactivate"
                                : "Approve"}
                            </DropdownMenuItem>
                          ) : null}
                          {company.statusValue !== "SUSPENDED" ? (
                            <DropdownMenuItem
                              onClick={() => onSuspend(company)}
                            >
                              <ShieldBan className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          ) : null}
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
