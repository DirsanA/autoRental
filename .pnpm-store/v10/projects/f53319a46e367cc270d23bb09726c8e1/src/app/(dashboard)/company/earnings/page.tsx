'use client';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

const monthlyData = [
  { month: 'Jan', revenue: 4500, profit: 3200 },
  { month: 'Feb', revenue: 5200, profit: 3800 },
  { month: 'Mar', revenue: 4800, profit: 3400 },
  { month: 'Apr', revenue: 6100, profit: 4500 },
  { month: 'May', revenue: 5900, profit: 4200 },
  { month: 'Jun', revenue: 7200, profit: 5400 },
];

const vehicleRevenue = [
  { name: 'Tesla Model 3', value: 4500 },
  { name: 'BMW X5', value: 3800 },
  { name: 'Toyota Camry', value: 2100 },
  { name: 'Audi A4', value: 3200 },
  { name: 'Honda Civic', value: 1800 },
];

export default function Earnings() {
  return (
    <div className="space-y-8">
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-900 text-2xl">Earnings & Reports</h2>
          <p className="text-slate-500">Track your revenue, profits, and financial performance.</p>
        </div>
        <div className="flex sm:flex-row flex-col gap-3 w-full sm:w-auto">
          <button className="flex justify-center items-center gap-2 hover:bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl w-full sm:w-auto font-medium text-slate-600 text-sm transition-colors">
            <Calendar size={18} />
            <span>Last 6 Months</span>
          </button>
          <button className="flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 px-4 py-2 rounded-xl w-full sm:w-auto font-medium text-white text-sm transition-colors">
            <Download size={18} />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <div className="bg-white shadow-sm p-6 border border-slate-100 rounded-2xl min-w-0">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 text-sm">
              <ArrowUpRight size={16} />
              12.5%
            </div>
          </div>
          <p className="font-medium text-slate-500 text-sm">Total Revenue</p>
          <h3 className="mt-1 font-bold text-slate-900 text-2xl">$33,700</h3>
        </div>
        <div className="bg-white shadow-sm p-6 border border-slate-100 rounded-2xl min-w-0">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center gap-1 font-bold text-blue-600 text-sm">
              <ArrowUpRight size={16} />
              8.2%
            </div>
          </div>
          <p className="font-medium text-slate-500 text-sm">Net Profit</p>
          <h3 className="mt-1 font-bold text-slate-900 text-2xl">$24,500</h3>
        </div>
        <div className="bg-white shadow-sm p-6 border border-slate-100 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <BarChart3 size={24} />
            </div>
            <div className="flex items-center gap-1 font-bold text-rose-600 text-sm">
              <ArrowDownRight size={16} />
              3.1%
            </div>
          </div>
          <p className="font-medium text-slate-500 text-sm">Avg. Booking Value</p>
          <h3 className="mt-1 font-bold text-slate-900 text-2xl">$420</h3>
        </div>
      </div>

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-white shadow-sm p-6 border border-slate-100 rounded-2xl">
          <h3 className="mb-6 font-bold text-slate-900 text-lg">Monthly Revenue vs Profit</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow-sm p-6 border border-slate-100 rounded-2xl">
          <h3 className="mb-6 font-bold text-slate-900 text-lg">Revenue by Vehicle Model</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis 
                  type="number"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
