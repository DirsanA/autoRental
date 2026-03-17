"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Building2, Users, TrendingUp, ShieldAlert, Plus } from "lucide-react";
import { CompanyFilters } from "./CompanyFilters";
import { CompanyTable } from "./CompanyTable";
import { mockCompanies, Company } from "./data";

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  note?: string;
  highlight?: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  note,
  highlight,
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-3 transition-shadow hover:shadow-md ${
        highlight ? "border-primary/30" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CompanyManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCompanies = useMemo(() => {
    return mockCompanies.filter((co) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        co.name.toLowerCase().includes(q) ||
        co.slug.toLowerCase().includes(q) ||
        co.ownerName.toLowerCase().includes(q) ||
        co.ownerEmail.toLowerCase().includes(q);

      const matchesPlan = planFilter === "all" || co.plan === planFilter;
      const matchesStatus =
        statusFilter === "all" || co.status === statusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [search, planFilter, statusFilter]);

  // ─── Derived stats ─────────────────────────────────────────────────────────
  const totalCompanies = mockCompanies.length;
  const activeCompanies = mockCompanies.filter(
    (c) => c.status === "active",
  ).length;
  const suspendedOrExpired = mockCompanies.filter(
    (c) => c.status === "suspended" || c.status === "expired",
  ).length;
  const totalSeats = mockCompanies.reduce((a, c) => a + c.seatsUsed, 0);

  // ─── Handlers (stubs for now) ───────────────────────────────────────────────
  const handleView = (co: Company) =>
    router.push(`/sysadmin/companies/${co.id}`);
  const handleEdit = (co: Company) => console.log("Edit", co);
  const handleSuspend = (co: Company) => console.log("Suspend", co);
  const handleReactivate = (co: Company) => console.log("Reactivate", co);
  const handleDelete = (co: Company) => console.log("Delete", co);
  const handleAddCompany = () => console.log("Open add company dialog");

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="gap-6 p-6 md:p-8">
          {/* ── Page header ───────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Company Management
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Oversee all registered companies, their subscription plans, seat
                usage, and account status.
              </p>
            </div>
            <Button onClick={handleAddCompany} className="gap-2 shrink-0 mt-1">
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </div>

          {/* ── Stats row ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Companies"
              value={totalCompanies}
              icon={Building2}
              note="Across all plans"
            />
            <StatCard
              label="Active"
              value={activeCompanies}
              icon={TrendingUp}
              note={`${Math.round((activeCompanies / totalCompanies) * 100)}% of total`}
              highlight
            />
            <StatCard
              label="Suspended / Expired"
              value={suspendedOrExpired}
              icon={ShieldAlert}
              note="Require attention"
            />
            <StatCard
              label="Total Seats Used"
              value={totalSeats}
              icon={Users}
              note="Combined across companies"
            />
          </div>

          {/* ── Filters & action ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CompanyFilters
              search={search}
              onSearchChange={setSearch}
              planFilter={planFilter}
              onPlanFilterChange={setPlanFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>

          {/* ── Results meta ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              {filteredCompanies.length} of {totalCompanies} companies shown
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>
                Active:{" "}
                {filteredCompanies.filter((c) => c.status === "active").length}
              </span>
              <span>
                Pending:{" "}
                {filteredCompanies.filter((c) => c.status === "pending").length}
              </span>
              <span>
                Suspended:{" "}
                {
                  filteredCompanies.filter((c) => c.status === "suspended")
                    .length
                }
              </span>
            </div>
          </div>

          {/* ── Table ────────────────────────────────────────────────────── */}
          <CompanyTable
            companies={filteredCompanies}
            onView={handleView}
            onEdit={handleEdit}
            onSuspend={handleSuspend}
            onReactivate={handleReactivate}
            onDelete={handleDelete}
          />
        </Main>
      </div>
    </div>
  );
}
