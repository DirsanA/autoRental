'use client';
import React, { useState, useRef } from 'react';
import {
  Building2, Mail, Phone, MapPin, Globe,
  ShieldCheck, Upload, Save, Trash2, X,
  Edit3, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function SmartProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mock State for Demo
  const [companyInfo, setCompanyInfo] = useState({
    name: "Elite Fleet Solutions",
    website: "www.elitefleet.com",
    email: "contact@elitefleet.com",
    phone: "+1 (555) 000-1234",
    address: "123 Luxury Lane, Beverly Hills, CA 90210, United States"
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogo(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/5 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-border/50 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl">
            <Building2 className="text-emerald-600" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Organization Hub</h2>
            <p className="text-muted-foreground text-sm">Manage identity, security, and presence.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
              >
                <Save size={18} />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Edit3 size={18} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Branding & Trust */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-muted/5 dark:bg-slate-900/50 p-8 rounded-3xl border border-border/50 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <ShieldCheck className="text-emerald-500 opacity-20" size={80} />
            </div>

            <div className="relative inline-block group">
              <div className="w-32 h-32 bg-muted/40 dark:bg-slate-950/40 rounded-[2.5rem] border-4 border-background shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                {logo ? (
                  <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={40} className="text-muted-foreground" />
                )}
              </div>

              {/* Image Actions */}
              <div className="absolute -bottom-2 -right-2 flex gap-2">
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-emerald-500 text-white rounded-lg shadow-lg hover:bg-emerald-600 transition-colors"
                  title="Upload Logo"
                >
                  <Upload size={16} />
                </button>
                {logo && (
                  <button
                    onClick={removeLogo}
                    className="p-2 bg-rose-500 text-white rounded-lg shadow-lg hover:bg-rose-600 transition-colors"
                    title="Remove Logo"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-foreground">{companyInfo.name}</h3>
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Car Rental Services</p>
            </div>

            <div className="mt-6 inline-flex items-center justify-center gap-2 py-2 px-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-2xl font-bold text-xs border border-emerald-500/20">
              <CheckCircle2 size={14} />
              Verified Entity
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-200">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-400" />
              Compliance Tasks
            </h4>
            <div className="space-y-4">
              {[
                { label: 'KYC Verification', status: 'Done', color: 'bg-emerald-500' },
                { label: 'Tax ID Update', status: 'Pending', color: 'bg-amber-500' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`${item.color} px-2 py-1 rounded-md font-bold text-[10px]`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-muted/5 dark:bg-slate-900/50 p-8 rounded-3xl border border-border/50 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-8 border-b border-border/50 pb-4">Core Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <EditableField
                label="Corporate Name"
                icon={<Building2 size={18} />}
                value={companyInfo.name}
                isEditing={isEditing}
              />
              <EditableField
                label="Official Website"
                icon={<Globe size={18} />}
                value={companyInfo.website}
                isEditing={isEditing}
              />
              <EditableField
                label="Contact Email"
                icon={<Mail size={18} />}
                value={companyInfo.email}
                isEditing={isEditing}
              />
              <EditableField
                label="Business Phone"
                icon={<Phone size={18} />}
                value={companyInfo.phone}
                isEditing={isEditing}
              />
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter ml-1">Headquarters Address</label>
                <div className={`flex gap-3 p-3 rounded-2xl border transition-all ${isEditing
                    ? 'border-emerald-500/30 ring-4 ring-emerald-500/10 bg-background'
                    : 'border-border/50 bg-muted/20 dark:bg-slate-950/20'
                  }`}>
                  <MapPin className="text-muted-foreground shrink-0" size={18} />
                  {isEditing ? (
                    <textarea rows={2} className="w-full bg-transparent outline-none text-sm text-foreground resize-none" defaultValue={companyInfo.address} />
                  ) : (
                    <span className="text-sm text-muted-foreground leading-relaxed">{companyInfo.address}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/5 dark:bg-slate-900/50 p-8 rounded-3xl border border-border/50 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground">Legal Repository</h3>
              <span className="text-[10px] font-bold px-2 py-1 bg-muted text-muted-foreground rounded-md border border-border/50">2 DOCUMENTS</span>
            </div>

            <div className="grid gap-3">
              {[
                { name: 'Business_License_2024.pdf', size: '1.2 MB' },
                { name: 'Insurance_Contract.pdf', size: '3.4 MB' }
              ].map((doc, i) => (
                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-border/50 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-muted/40 dark:bg-slate-950/30 rounded-xl group-hover:bg-background group-hover:shadow-sm">
                      <ShieldCheck size={20} className="text-muted-foreground group-hover:text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.size} • PDF Document</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[11px] font-bold text-emerald-600 dark:text-emerald-300 bg-background border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10">View</button>
                    <button className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              <button className="mt-2 border-2 border-dashed border-border rounded-2xl p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all group">
                <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
                <span className="text-sm font-bold">Add Legal Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for form fields to keep things DRY
function EditableField({
  label,
  icon,
  value,
  isEditing,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  isEditing: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter ml-1">{label}</label>
      <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isEditing
          ? 'border-emerald-500/30 ring-4 ring-emerald-500/10 bg-background'
          : 'border-border/50 bg-muted/20 dark:bg-slate-950/20'
        }`}>
        <span className="text-muted-foreground">{icon}</span>
        {isEditing ? (
          <input type="text" className="w-full bg-transparent outline-none text-sm text-foreground" defaultValue={value} />
        ) : (
          <span className="text-sm text-muted-foreground font-medium">{value}</span>
        )}
      </div>
    </div>
  );
}