'use client';
import React, { useState } from 'react';
import { 
  Search, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  Car,
  MoreHorizontal
} from 'lucide-react';
import { MOCK_BOOKINGS, Booking } from '../types';

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Booking["status"]>("all");

  const getStatusStyle = (status: Booking['status']) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
      case 'pending': return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
      case 'rejected': return 'bg-rose-500/10 text-rose-700 dark:text-rose-300';
      case 'completed': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      b.customerName.toLowerCase().includes(q) ||
      b.vehicleName.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" ? true : b.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-foreground text-2xl">Booking Management</h2>
          <p className="text-muted-foreground">Review and manage vehicle reservation requests.</p>
        </div>
      </div>

      <div className="bg-card shadow-sm border border-border rounded-2xl overflow-hidden text-card-foreground">
        <div className="flex sm:flex-row flex-col justify-between items-center gap-4 p-4 border-border border-b">
          <div className="relative w-full sm:w-64">
            <Search className="top-1/2 left-3 absolute text-muted-foreground -translate-y-1/2" size={18} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              className="bg-background py-2 pr-4 pl-10 border border-input focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm transition-all text-foreground placeholder:text-muted-foreground"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              className="flex flex-1 sm:flex-none bg-background px-4 py-2 border border-border rounded-xl font-medium text-foreground text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
            <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl font-medium text-white text-sm transition-colors">
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-border border-b">
                <th className="px-6 py-4 font-bold text-muted-foreground text-xs uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-bold text-muted-foreground text-xs uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 font-bold text-muted-foreground text-xs uppercase tracking-wider">Dates</th>
                <th className="px-6 py-4 font-bold text-muted-foreground text-xs uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 font-bold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-muted-foreground text-xs text-right uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex justify-center items-center bg-muted rounded-full w-10 h-10 font-bold text-muted-foreground">
                        {booking.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{booking.customerName}</p>
                        <p className="text-muted-foreground text-xs">ID: {booking.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Car size={16} className="text-muted-foreground" />
                      <span className="font-medium text-foreground text-sm">{booking.vehicleName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Calendar size={14} />
                        <span>{booking.startDate} to {booking.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock size={12} />
                        <span>Booked on {booking.createdAt}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-foreground text-sm">${booking.totalAmount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button className="bg-emerald-500/10 hover:bg-emerald-500/20 p-2 rounded-lg text-emerald-600 dark:text-emerald-300 transition-colors" title="Approve">
                            <Check size={18} />
                          </button>
                          <button className="bg-rose-500/10 hover:bg-rose-500/20 p-2 rounded-lg text-rose-600 dark:text-rose-300 transition-colors" title="Reject">
                            <X size={18} />
                          </button>
                        </>
                      )}
                      <button className="hover:bg-muted p-2 rounded-lg text-muted-foreground transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center bg-muted/40 p-4 border-border border-t">
          <p className="font-medium text-muted-foreground text-xs">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-border rounded-lg font-bold text-muted-foreground text-xs cursor-not-allowed">Previous</button>
            <button className="hover:bg-background px-3 py-1 border border-border rounded-lg font-bold text-foreground text-xs transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
