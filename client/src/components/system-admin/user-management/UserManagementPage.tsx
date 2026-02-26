"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { mockUsers, User } from "./data";

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const roles = useMemo(() => {
    const uniqueRoles = new Set(mockUsers.map((u) => u.role));
    return Array.from(uniqueRoles).sort();
  }, []);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        search === "" ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, roleFilter, statusFilter]);

  const handleEdit = (user: User) => console.log("Edit", user);
  const handleSuspend = (user: User) => console.log("Suspend", user);
  const handleDelete = (user: User) => console.log("Delete", user);
  const handleResendInvite = (user: User) =>
    console.log("Resend invite to", user.email);
  const handleInviteUser = () => console.log("Open invite dialog");

  return (
    <div className="relative flex h-dvh w-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Main className="gap-6 p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Manage team members, their roles, and account status. Invite new
              users or update existing ones.
            </p>
          </div>

          {/* Filters and Actions Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <UserFilters
              search={search}
              onSearchChange={setSearch}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              roles={roles}
            />
            <Button onClick={handleInviteUser} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-primary"></span>
              {filteredUsers.length} of {mockUsers.length} users shown
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                Active: {mockUsers.filter((u) => u.status === "active").length}
              </span>
              <span className="text-muted-foreground">
                Invited:{" "}
                {mockUsers.filter((u) => u.status === "invited").length}
              </span>
            </div>
          </div>

          {/* Table */}
          <UserTable
            users={filteredUsers}
            onEdit={handleEdit}
            onSuspend={handleSuspend}
            onDelete={handleDelete}
            onResendInvite={handleResendInvite}
          />
        </Main>
      </div>
    </div>
  );
}
