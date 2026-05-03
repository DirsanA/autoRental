"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Flame,
  FileQuestion,
} from "lucide-react";

import { DisputeFilters } from "./DisputeFilters";
import { DisputeTable } from "./DisputeTable";
import { mockDisputes } from "./data";
import type { Dispute, DisputeStatus } from "./types";

// ─── Summary stat card ─────────────────────────────────────────────────────────
function StatCard({
  label,
  count,
  icon: Icon,
  colorClass,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className={`rounded-lg p-2 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{count}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function DisputeManagementPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredDisputes = useMemo(() => {
    return mockDisputes.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        q === "" ||
        d.caseNumber.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.claimant.name.toLowerCase().includes(q) ||
        d.respondent.name.toLowerCase().includes(q);

      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      const matchCategory =
        categoryFilter === "all" || d.category === categoryFilter;
      const matchPriority =
        priorityFilter === "all" || d.priority === priorityFilter;

      return matchSearch && matchStatus && matchCategory && matchPriority;
    });
  }, [search, statusFilter, categoryFilter, priorityFilter]);

  const countByStatus = (s: DisputeStatus) =>
    mockDisputes.filter((d) => d.status === s).length;

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleView = (d: Dispute) =>
    router.push(`/sysadmin/disputes/${d.id}`);

  const handleAssign = (d: Dispute) =>
    console.log("Assign", d.caseNumber);

  const handleResolve = (d: Dispute) =>
    console.log("Resolve", d.caseNumber);

  const handleEscalate = (d: Dispute) =>
    console.log("Escalate", d.caseNumber);

  const handleClose = (d: Dispute) =>
    console.log("Close", d.caseNumber);

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="gap-6 p-6 md:p-8">
          {/* Page Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Disputes
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Review, assign, and resolve disputes raised between renters,
              companies, and P2P hosts on the platform.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Open"
              count={countByStatus("open")}
              icon={FileQuestion}
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
            />
            <StatCard
              label="Under Review"
              count={countByStatus("under_review")}
              icon={Clock3}
              colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
            />
            <StatCard
              label="Escalated"
              count={countByStatus("escalated")}
              icon={Flame}
              colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
            />
            <StatCard
              label="Resolved / Closed"
              count={
                countByStatus("resolved") + countByStatus("closed")
              }
              icon={CheckCircle2}
              colorClass="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <DisputeFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
            />
          </div>

          {/* Count info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            {filteredDisputes.length} of {mockDisputes.length} disputes shown
          </div>

          {/* Table */}
          <DisputeTable
            disputes={filteredDisputes}
            onView={handleView}
            onAssign={handleAssign}
            onResolve={handleResolve}
            onEscalate={handleEscalate}
            onClose={handleClose}
          />
        </Main>
      </div>
    </div>
  );
}
