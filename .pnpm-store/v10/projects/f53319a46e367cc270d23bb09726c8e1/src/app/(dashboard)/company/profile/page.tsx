"use client";

import { useEffect, useState } from "react";
import { Building2, Mail, Phone, MapPin, Globe, ShieldCheck, Upload, Save } from 'lucide-react';
import { CompanyProfileSkeleton } from "./company-profile-skeleton";

export default function Profile() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching - replace with actual API call when ready
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <CompanyProfileSkeleton />;
  }

  return (
    <div className="space-y-8 mx-auto max-w-4xl">
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-900 text-2xl">Company Profile</h2>
          <p className="text-slate-500">Manage your business information and verification status.</p>
        </div>
        <button className="flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 shadow-lg px-6 py-2 rounded-xl w-full sm:w-auto font-bold text-white transition-colors">
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <div className="bg-white shadow-sm p-6 border border-slate-100 rounded-2xl text-center">
            <div className="inline-block relative mb-4">
              <div className="flex justify-center items-center bg-slate-100 shadow-md border-4 border-white rounded-3xl w-32 h-32 overflow-hidden">
                <Building2 size={48} className="text-slate-300" />
              </div>
              <button className="-right-2 -bottom-2 absolute bg-white shadow-lg p-2 border border-slate-100 rounded-xl text-emerald-500 hover:text-emerald-600 transition-colors">
                <Upload size={18} />
              </button>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Elite Fleet Solutions</h3>
            <p className="text-slate-500 text-sm">Premium Car Rentals</p>

            <div className="flex justify-center items-center gap-2 bg-emerald-50 mt-6 px-3 py-1.5 border border-emerald-100 rounded-full font-bold text-emerald-600 text-xs">
              <ShieldCheck size={14} />
              <span>Verified Business</span>
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 border border-slate-100 rounded-2xl">
            <h4 className="mb-4 font-bold text-slate-900 text-sm">Verification Status</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">Business License</span>
                <span className="font-bold text-emerald-600 text-xs">Approved</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">Insurance Docs</span>
                <span className="font-bold text-emerald-600 text-xs">Approved</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">Tax Certificate</span>
                <span className="font-bold text-amber-600 text-xs">Pending</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:col-span-2">
          <div className="bg-white shadow-sm p-8 border border-slate-100 rounded-2xl">
            <h3 className="mb-6 font-bold text-slate-900 text-lg">General Information</h3>
            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Company Name</label>
                <div className="relative">
                  <Building2 className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={16} />
                  <input type="text" defaultValue="Elite Fleet Solutions" className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Website</label>
                <div className="relative">
                  <Globe className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={16} />
                  <input type="text" defaultValue="www.elitefleet.com" className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={16} />
                  <input type="email" defaultValue="contact@elitefleet.com" className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={16} />
                  <input type="text" defaultValue="+1 (555) 000-1234" className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm" />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Office Address</label>
                <div className="relative">
                  <MapPin className="top-3 left-3 absolute text-slate-400" size={16} />
                  <textarea rows={3} defaultValue="123 Luxury Lane, Beverly Hills, CA 90210, United States" className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm resize-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm p-8 border border-slate-100 rounded-2xl">
            <h3 className="mb-6 font-bold text-slate-900 text-lg">Legal Documents</h3>
            <div className="space-y-4">
              {[
                { name: 'Business Registration.pdf', size: '2.4 MB', date: 'Oct 12, 2023' },
                { name: 'Fleet Insurance Policy.pdf', size: '5.1 MB', date: 'Jan 05, 2024' },
              ].map((doc, i) => (
                <div key={i} className="group flex justify-between items-center hover:bg-slate-50 p-4 border border-slate-100 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 group-hover:bg-white p-2 rounded-lg text-slate-500 transition-colors">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{doc.name}</p>
                      <p className="text-slate-500 text-xs">{doc.size} • Uploaded on {doc.date}</p>
                    </div>
                  </div>
                  <button className="font-bold text-emerald-600 text-xs hover:underline">View</button>
                </div>
              ))}
              <button className="flex flex-col items-center gap-2 hover:bg-emerald-50/30 py-4 border-2 border-slate-200 hover:border-emerald-200 border-dashed rounded-2xl w-full text-slate-400 hover:text-emerald-500 transition-all">
                <Upload size={24} />
                <span className="font-bold text-sm">Upload New Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
