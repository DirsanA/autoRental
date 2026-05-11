"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  RefreshCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  Car,
  Calendar,
  CreditCard,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import {
  fetchRenterBookings,
  type RenterBookingListItem,
  type RenterBookingPaymentState,
  type RenterBookingsPagination,
  type RenterBookingStatus,
} from "@/lib/bookings-api";
import { cn } from "@/lib/utils";
import { BookingHistoryPageSkeleton } from "@/components/shared/bookings/booking-history-skeleton";

const PAGE_SIZE = 10;

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

// Status configurations with icons
const STATUS_CONFIG: Record<
  RenterBookingStatus,
  { label: string; icon: LucideIcon; variant: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    variant:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle,
    variant: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  ACTIVE: {
    label: "Active",
    icon: TrendingUp,
    variant: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    variant: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    variant: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400",
  },
  DISPUTED: {
    label: "Disputed",
    icon: AlertTriangle,
    variant: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400",
  },
};

const PAYMENT_CONFIG: Record<
  RenterBookingPaymentState,
  { label: string; icon: LucideIcon; variant: string }
> = {
  paid: {
    label: "Paid",
    icon: CheckCircle,
    variant: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    variant: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  },
};

// Stats Cards Component
const StatsCards = ({ bookings }: { bookings: RenterBookingListItem[] }) => {
  const stats = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter(b => b.status === "ACTIVE").length;
    const completed = bookings.filter(b => b.status === "COMPLETED").length;
    const cancelled = bookings.filter(b => b.status === "CANCELLED").length;
    const totalValue = bookings.reduce((sum, b) => sum + b.pricing.totalAmount, 0);
    const paidValue = bookings
      .filter(b => b.paymentState === "paid")
      .reduce((sum, b) => sum + b.pricing.totalAmount, 0);
    
    return { total, active, completed, cancelled, totalValue, paidValue };
  }, [bookings]);

  const statCards = [
    {
      title: "Total Bookings",
      value: stats.total,
      icon: Car,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-950/20",
      textColor: "text-blue-700 dark:text-blue-300",
      valueColor: "text-blue-900 dark:text-blue-100",
    },
    {
      title: "Active Trips",
      value: stats.active,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-950/20",
      textColor: "text-emerald-700 dark:text-emerald-300",
      valueColor: "text-emerald-900 dark:text-emerald-100",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      gradient: "from-sky-500 to-sky-600",
      bgGradient: "from-sky-50 to-sky-100 dark:from-sky-950/30 dark:to-sky-950/20",
      textColor: "text-sky-700 dark:text-sky-300",
      valueColor: "text-sky-900 dark:text-sky-100",
    },
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalValue, "USD"),
      icon: DollarSign,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-950/20",
      textColor: "text-purple-700 dark:text-purple-300",
      valueColor: "text-purple-900 dark:text-purple-100",
    },
  ];

  return (
    <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, idx) => (
        <div
          key={idx}
          className={cn(
            "relative hover:shadow-md p-4 border border-border/50 rounded-xl overflow-hidden transition-all",
            stat.bgGradient
          )}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className={cn("font-medium text-sm", stat.textColor)}>{stat.title}</p>
              <p className={cn("font-bold text-2xl", stat.valueColor)}>{stat.value}</p>
            </div>
            <div className={cn("bg-white/50 dark:bg-white/5 p-2 rounded-lg")}>
              <stat.icon className={cn("w-5 h-5", stat.textColor)} />
            </div>
          </div>
          <div className={cn("right-0 bottom-0 absolute opacity-10 w-20 h-20")}>
            <stat.icon className="w-full h-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Booking Table Row
const BookingTableRow = ({ booking }: { booking: RenterBookingListItem }) => {
  const router = useRouter();
  const vehicleName =
    [booking.vehicle?.make, booking.vehicle?.model, booking.vehicle?.year]
      .filter(Boolean)
      .join(" ") || "Vehicle unavailable";

  const status = STATUS_CONFIG[booking.status];
  const payment = PAYMENT_CONFIG[booking.paymentState];

  return (
    <TableRow className="group hover:bg-muted/30 transition-colors">
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Car className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{vehicleName}</p>
            <p className="text-muted-foreground text-xs">ID: {booking.id.slice(-8)}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(booking.startTime)}</span>
          </div>
          <p className="text-muted-foreground text-xs">
            → {formatDate(booking.endTime)}
          </p>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="outline" className={cn("rounded-full font-medium", payment.variant)}>
          <payment.icon className="mr-1 w-3 h-3" />
          {payment.label}
        </Badge>
      </TableCell>

      <TableCell>
        <Badge variant="outline" className={cn("rounded-full font-medium", status.variant)}>
          <status.icon className="mr-1 w-3 h-3" />
          {status.label}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <div>
          <p className="font-bold text-foreground text-base">
            {formatCurrency(booking.pricing.totalAmount, booking.pricing.currency)}
          </p>
        </div>
      </TableCell>

      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 p-0 w-8 h-8 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/renter/booking-history/${encodeURIComponent(booking.bookingId || booking.id)}`)}>
              <Eye className="mr-2 w-4 h-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 w-4 h-4" />
              Payment Info
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/renter/booking-history/${encodeURIComponent(booking.bookingId || booking.id)}`)}
          className="hidden lg:inline-flex"
        >
          <Eye className="mr-2 w-4 h-4" />
          Details
        </Button>
      </TableCell>
    </TableRow>
  );
};

// Filter Bar Component
const FilterBar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  onRefresh,
  isLoading,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: RenterBookingStatus | "all";
  onStatusFilterChange: (value: RenterBookingStatus | "all") => void;
  paymentFilter: RenterBookingPaymentState | "all";
  onPaymentFilterChange: (value: RenterBookingPaymentState | "all") => void;
  onRefresh: () => void;
  isLoading: boolean;
}) => {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(localSearch), 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
      <div className="flex sm:flex-row flex-col flex-1 gap-3 sm:max-w-2xl">
        <div className="relative flex-1">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
          <Input
            placeholder="Search by vehicle, location, or booking ID..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="DISPUTED">Disputed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={onPaymentFilterChange}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="gap-2"
      >
        <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        Refresh
      </Button>
    </div>
  );
};

// Pagination Component
const PaginationBar = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}) => {
  const startItem = (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalItems);

  return (
    <div className="flex sm:flex-row flex-col justify-between items-center gap-4 pt-4 border-border/50 border-t">
      <p className="text-muted-foreground text-sm">
        Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
        <span className="font-medium text-foreground">{endItem}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span> bookings
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isLoading || currentPage <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="hidden sm:flex items-center gap-2">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={i}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className={cn(
                  "p-0 w-8 h-8",
                  currentPage === pageNum && "bg-primary text-primary-foreground"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
          {totalPages > 5 && <span className="text-muted-foreground">...</span>}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLoading || currentPage >= totalPages}
        >
          Next
          <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <div className="flex flex-col justify-center items-center bg-card p-12 border border-border/50 rounded-xl text-center">
    <div className="bg-muted p-4 rounded-full">
      <AlertCircle className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="mt-4 font-semibold text-foreground text-lg">No bookings found</h3>
    <p className="mt-2 text-muted-foreground text-sm">
      We could not find any bookings matching your criteria
    </p>
    <Button variant="outline" onClick={onClearFilters} className="mt-6">
      Clear all filters
    </Button>
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="bg-red-50 dark:bg-red-950/20 p-8 border border-red-200 dark:border-red-800 rounded-xl text-center">
    <AlertCircle className="mx-auto mb-3 w-10 h-10 text-red-600" />
    <p className="mb-4 font-medium text-red-700 dark:text-red-400 text-sm">{error}</p>
    <Button onClick={onRetry} variant="outline" className="bg-white border-red-300">
      Try Again
    </Button>
  </div>
);

// Main Component
export function RenterBookingHistoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RenterBookingStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<RenterBookingPaymentState | "all">("all");
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState<RenterBookingListItem[]>([]);
  const [pagination, setPagination] = useState<RenterBookingsPagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchRenterBookings({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        paymentState: paymentFilter === "all" ? undefined : paymentFilter,
        page,
        limit: PAGE_SIZE,
      });

      setBookings(result.bookings);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking history");
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, paymentFilter, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRefresh = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: RenterBookingStatus | "all") => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handlePaymentChange = useCallback((value: RenterBookingPaymentState | "all") => {
    setPaymentFilter(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setPage(1);
  }, []);

  const showSkeleton = isLoading && bookings.length === 0;

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <Header />
      <Main className="gap-6 p-6 md:p-8">
          {showSkeleton ? (
            <BookingHistoryPageSkeleton columns={6} rows={5} statCards={4} />
          ) : (
            <>
          {/* Header Section */}
          <div className="space-y-2">
            <h1 className="font-bold text-foreground text-3xl md:text-4xl tracking-tight">
              Booking History
            </h1>
            <p className="text-muted-foreground">
              Track and manage all your rental bookings in one place
            </p>
          </div>

          {/* Stats Cards - Only show when data is loaded */}
          {!showSkeleton && !error && bookings.length > 0 && (
            <StatsCards bookings={bookings} />
          )}

          {/* Filters */}
          <FilterBar
            search={search}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusChange}
            paymentFilter={paymentFilter}
            onPaymentFilterChange={handlePaymentChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />

          {/* Main Table */}
          <div className="bg-card shadow-sm border border-border/50 rounded-xl">
            {error ? (
              <div className="p-6">
                <ErrorState error={error} onRetry={handleRefresh} />
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState onClearFilters={handleClearFilters} />
            ) : (
              <>
                <div className={cn("transition-opacity", isLoading && "opacity-50")}>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[280px]">Vehicle</TableHead>
                        <TableHead>Trip Dates</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <BookingTableRow key={booking.id} booking={booking} />
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="p-4">
                  <PaginationBar
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    onPageChange={setPage}
                    isLoading={isLoading}
                  />
                </div>
              </>
            )}
          </div>
            </>
          )}
        </Main>
    
    </div>
  );
}
