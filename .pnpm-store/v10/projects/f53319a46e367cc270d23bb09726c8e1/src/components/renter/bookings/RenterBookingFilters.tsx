"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  RenterBookingPaymentState,
  RenterBookingStatus,
} from "@/lib/bookings-api";

interface RenterBookingFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: RenterBookingStatus | "all";
  onStatusFilterChange: (value: RenterBookingStatus | "all") => void;
  paymentFilter: RenterBookingPaymentState | "all";
  onPaymentFilterChange: (value: RenterBookingPaymentState | "all") => void;
}

export function RenterBookingFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentFilter,
  onPaymentFilterChange,
}: RenterBookingFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Input
        placeholder="Search by booking ID, vehicle, or location..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="sm:max-w-xs"
      />

      <Select
        value={statusFilter}
        onValueChange={(value) =>
          onStatusFilterChange(value as RenterBookingStatus | "all")
        }
      >
        <SelectTrigger className="sm:w-[180px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectItem value="DISPUTED">Disputed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={paymentFilter}
        onValueChange={(value) =>
          onPaymentFilterChange(value as RenterBookingPaymentState | "all")
        }
      >
        <SelectTrigger className="sm:w-[180px]">
          <SelectValue placeholder="All payments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All payments</SelectItem>
          <SelectItem value="pending">Pending payment</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
