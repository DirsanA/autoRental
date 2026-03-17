'use client'
import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Car,
  Wrench,
  CheckCircle2,
  Clock,
  FileText,
  Trash2,
  Edit2
} from 'lucide-react';
import { MOCK_VEHICLES, Vehicle } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function FleetManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = vehicles.filter(v =>
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAvailability = (id: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        // If it's available, mark as booked (taken). If it's booked/maintenance, mark as available.
        // This allows manual override.
        const newStatus: Vehicle['status'] = v.status === 'available' ? 'booked' : 'available';
        return { ...v, status: newStatus };
      }
      return v;
    }));
  };

  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'booked': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'maintenance': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-900 text-2xl">Fleet Management</h2>
          <p className="text-slate-500">Manage your vehicles, pricing, and maintenance schedules.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 shadow-lg px-4 py-2 rounded-xl font-medium text-white transition-colors">
          <Plus size={18} />
          <span>Add Vehicle</span>
        </button>
      </div>

      <div className="flex sm:flex-row flex-col gap-4">
        <div className="relative flex-1">
          <Search className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={18} />
          <input
            type="text"
            placeholder="Search by make, model or plate..."
            className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 hover:bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl font-medium text-slate-600 transition-colors">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredVehicles.map((vehicle) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={vehicle.id}
              className="group bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status.toUpperCase()}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{vehicle.make} {vehicle.model}</h3>
                    <p className="flex items-center gap-1 text-slate-500 text-sm">
                      <Clock size={14} />
                      <span>{vehicle.year} • {vehicle.plate}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-sm">Price/Day</p>
                    <p className="font-bold text-emerald-600 text-lg">${vehicle.pricePerDay}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 mb-4 p-3 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${vehicle.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="font-bold text-slate-700 text-xs">Manual Availability</span>
                  </div>
                  <button
                    onClick={() => toggleAvailability(vehicle.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${vehicle.status === 'available' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${vehicle.status === 'available' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="gap-4 grid grid-cols-2 mb-6">
                  <div className="bg-slate-50 p-3 border border-slate-100 rounded-xl">
                    <p className="mb-1 font-bold text-[10px] text-slate-400 uppercase tracking-wider">Last Service</p>
                    <p className="font-medium text-slate-700 text-xs">{vehicle.lastMaintenance}</p>
                  </div>
                  <div className="bg-slate-50 p-3 border border-slate-100 rounded-xl">
                    <p className="mb-1 font-bold text-[10px] text-slate-400 uppercase tracking-wider">Next Service</p>
                    <p className="font-medium text-slate-700 text-xs">{vehicle.nextMaintenance}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex flex-1 justify-center items-center gap-2 hover:bg-slate-50 py-2 border border-slate-200 rounded-xl font-medium text-slate-600 text-sm transition-colors">
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>
                  <button className="flex flex-1 justify-center items-center gap-2 hover:bg-slate-50 py-2 border border-slate-200 rounded-xl font-medium text-slate-600 text-sm transition-colors">
                    <FileText size={16} />
                    <span>Docs</span>
                  </button>
                  <button className="hover:bg-rose-50 p-2 border border-slate-200 hover:border-rose-200 rounded-xl text-rose-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
