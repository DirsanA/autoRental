'use client';
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  User, 
  Car,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { MOCK_BOOKINGS, Booking } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const getStatusStyle = (status: Booking['status']) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-slate-900 text-2xl">Booking Management</h2>
          <p className="text-slate-500">Review and manage vehicle reservation requests.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
        <div className="flex sm:flex-row flex-col justify-between items-center gap-4 p-4 border-slate-100 border-b">
          <div className="relative w-full sm:w-64">
            <Search className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={18} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 hover:bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl font-medium text-slate-600 text-sm transition-colors">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl font-medium text-white text-sm transition-colors">
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-slate-100 border-b">
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Dates</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs text-right uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex justify-center items-center bg-slate-100 rounded-full w-10 h-10 font-bold text-slate-600">
                        {booking.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{booking.customerName}</p>
                        <p className="text-slate-500 text-xs">ID: {booking.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Car size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-700 text-sm">{booking.vehicleName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600 text-xs">
                        <Calendar size={14} />
                        <span>{booking.startDate} to {booking.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Clock size={12} />
                        <span>Booked on {booking.createdAt}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 text-sm">${booking.totalAmount}</span>
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
                          <button className="bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg text-emerald-600 transition-colors" title="Approve">
                            <Check size={18} />
                          </button>
                          <button className="bg-rose-50 hover:bg-rose-100 p-2 rounded-lg text-rose-600 transition-colors" title="Reject">
                            <X size={18} />
                          </button>
                        </>
                      )}
                      <button className="hover:bg-slate-100 p-2 rounded-lg text-slate-400 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center bg-slate-50 p-4 border-slate-100 border-t">
          <p className="font-medium text-slate-500 text-xs">Showing 2 of 2 bookings</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg font-bold text-slate-400 text-xs cursor-not-allowed">Previous</button>
            <button className="hover:bg-white px-3 py-1 border border-slate-200 rounded-lg font-bold text-slate-600 text-xs transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
