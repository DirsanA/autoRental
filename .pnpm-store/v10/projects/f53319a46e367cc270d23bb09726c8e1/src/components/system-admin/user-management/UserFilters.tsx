import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  accountTypeFilter: string;
  onAccountTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function UserFilters({
  search,
  onSearchChange,
  accountTypeFilter,
  onAccountTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Input
        placeholder="Search by name, email, or username..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="sm:max-w-xs"
      />

      <Select
        value={accountTypeFilter}
        onValueChange={onAccountTypeFilterChange}
      >
        <SelectTrigger className="sm:w-[180px]">
        <SelectValue placeholder="All account types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All people</SelectItem>
          <SelectItem value="USER">Users</SelectItem>
          <SelectItem value="ADMIN">Admins</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="sm:w-[180px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="SUSPENDED">Suspended</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
