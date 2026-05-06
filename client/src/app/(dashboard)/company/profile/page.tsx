"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  ShieldCheck,
  Upload,
  Save,
  Eye,
  EyeOff,
  FileText,
  AlertCircle,
  X,
  Download,
} from "lucide-react";
import { CompanyProfileSkeleton } from "./company-profile-skeleton";
import { useToast } from "@/hooks/use-toast";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";

const API_BASE_URL = resolveApiBaseUrl();

async function downloadFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}

export default function Profile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [originalCompany, setOriginalCompany] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Document preview modal
  const [docModal, setDocModal] = useState<{ url: string; title: string } | null>(null);

  // Inline error states
  const [saveError, setSaveError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/companies/me`, {
      credentials: "include",
      headers: { ...buildAuthHeader() },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCompany(data.data.company);
          setOriginalCompany(data.data.company);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Generate an object URL for logo preview immediately on file selection
  const logoPreviewUrl = useMemo(() => {
    if (logoFile) {
      return URL.createObjectURL(logoFile);
    }
    return null;
  }, [logoFile]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const handleCancel = () => {
    setIsEditing(false);
    setCompany(originalCompany);
    setLogoFile(null);
    setDocumentFile(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!company) return;
    setSaveError(null);
    setSaving(true);

    try {
      const companyId = company.id || company._id;
      if (!companyId) {
        setSaveError("Unable to determine company ID.");
        return;
      }

      const formData = new FormData();
      if (company.name) formData.append("name", company.name);
      if (company.website) formData.append("website", company.website);
      if (company.contactInfo?.email)
        formData.append("contactInfo[email]", company.contactInfo.email);
      if (company.contactInfo?.phoneNumber)
        formData.append("contactInfo[phoneNumber]", company.contactInfo.phoneNumber);
      if (company.contactInfo?.address)
        formData.append("contactInfo[address]", company.contactInfo.address);
      if (company.bio) formData.append("bio", company.bio);
      if (logoFile) formData.append("logo", logoFile);
      if (documentFile) formData.append("licenseDocument", documentFile);

      const res = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { ...buildAuthHeader() },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.error?.message ||
          data?.message ||
          "Unable to update profile. Please try again.";
        setSaveError(msg);
        return;
      }

      const isPendingApproval = company.status === "ACTIVE";

      toast({
        title: isPendingApproval ? "Profile update submitted" : "Profile updated",
        description: isPendingApproval
          ? "Your changes are pending admin approval. Your current profile remains active until reviewed."
          : "Your profile has been updated successfully.",
      });

      setCompany(data.data.company);
      setOriginalCompany(data.data.company);
      setLogoFile(null);
      setDocumentFile(null);
      setIsEditing(false);
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeader(),
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.error?.message ||
          data?.message ||
          "Password change failed. Please check your current password.";
        setPasswordError(msg);
        return;
      }

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <CompanyProfileSkeleton />;
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-slate-500 font-medium">Unable to load company profile.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-emerald-600 font-bold hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isVerified = company.status === "ACTIVE" || company.isVerified;
  // The visible logo: prefer the live preview of a selected file, then the stored URL
  const displayedLogo = logoPreviewUrl || company.logoUrl || null;

  return (
    <>
      {/* Document preview modal */}
      {docModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDocModal(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FileText size={18} className="text-emerald-600" />
                {docModal.title}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => downloadFile(docModal.url, docModal.title.toLowerCase().replace(/\s+/g, "_"))}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setDocModal(null)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="overflow-auto flex-1 p-4">
              {docModal.url.toLowerCase().endsWith(".pdf") ? (
                <embed src={docModal.url} className="w-full h-[70vh]" type="application/pdf" />
              ) : (
                <img src={docModal.url} alt={docModal.title} className="w-full h-auto object-contain rounded-xl" />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8 mx-auto max-w-4xl pb-12">
        {/* Header */}
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-bold text-slate-900 text-2xl">Company Profile</h2>
            <p className="text-slate-500">Manage your business information and verification status.</p>
          </div>
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex justify-center items-center gap-2 bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 shadow-lg px-6 py-2 rounded-xl w-full sm:w-auto font-bold text-white transition-colors"
              >
                <FileText size={18} />
                <span>Replace Saved Information</span>
              </button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex justify-center items-center gap-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 px-4 py-2 rounded-xl font-bold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 shadow-emerald-500/20 shadow-lg px-6 py-2 rounded-xl font-bold text-white transition-colors"
                >
                  {saving ? <Save size={18} className="animate-pulse" /> : <Save size={18} />}
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            )}
            {/* Inline save error banner */}
            {saveError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 w-full sm:max-w-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{saveError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-blue-800 text-sm">Profile Updates Require Approval</h4>
            <p className="text-blue-600 text-sm mt-1">
              To maintain platform security, any changes to your company profile, logo, or legal documents must be reviewed and approved by an administrator before taking effect. {!isEditing && 'Click "Replace Saved Information" to make changes.'}
            </p>
          </div>
        </div>

        <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 md:col-span-1">
            {/* Logo + status card */}
            <div className="bg-white shadow-sm p-6 border border-slate-100 rounded-2xl text-center">
              <div className="inline-block relative mb-4">
                <div className="flex justify-center items-center bg-slate-100 shadow-md border-4 border-white rounded-3xl w-32 h-32 overflow-hidden">
                  {displayedLogo ? (
                    <img
                      src={displayedLogo}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 size={48} className="text-slate-300" />
                  )}
                </div>
                {isEditing && (
                  <label className="-right-2 -bottom-2 absolute bg-white shadow-lg p-2 border border-slate-100 rounded-xl text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer">
                    <Upload size={18} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
              {logoFile && (
                <p className="text-[10px] text-emerald-600 font-medium mb-2">
                  Preview: {logoFile.name}
                </p>
              )}
              <h3 className="font-bold text-slate-900 text-lg">{company.name}</h3>
              <p className="text-slate-500 text-sm">TIN: {company.tinNumber}</p>

              <div
                className={`flex justify-center items-center gap-2 mt-6 px-3 py-1.5 border rounded-full font-bold text-xs ${
                  isVerified
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : "bg-amber-50 border-amber-100 text-amber-600"
                }`}
              >
                <ShieldCheck size={14} />
                <span>{isVerified ? "Verified Business" : "Verification Pending"}</span>
              </div>
            </div>

            {/* Change password card */}
            <div className="bg-white shadow-sm p-8 border border-slate-100 rounded-2xl">
              <h3 className="mb-6 font-bold text-slate-900 text-lg">Change Password</h3>

              <div className="space-y-4">
                {/* Inline password error */}
                {passwordError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {(["current", "new", "confirm"] as const).map((field) => {
                  const labels = { current: "Current Password", new: "New Password", confirm: "Confirm Password" };
                  const keys = { current: "currentPassword", new: "newPassword", confirm: "confirmPassword" } as const;
                  return (
                    <div key={field} className="relative">
                      <input
                        type={showPassword[field] ? "text" : "password"}
                        placeholder={labels[field]}
                        value={passwordData[keys[field]]}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, [keys[field]]: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm pr-10 outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword({ ...showPassword, [field]: !showPassword[field] })
                        }
                        className="top-1/2 right-3 absolute text-slate-400 -translate-y-1/2"
                      >
                        {showPassword[field] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-4 py-2 rounded-xl w-full text-white font-bold transition-colors"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6 md:col-span-2">
            {/* General info */}
            <div className="bg-white shadow-sm p-8 border border-slate-100 rounded-2xl">
              <h3 className="mb-6 font-bold text-slate-900 text-lg">General Information</h3>
              <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Company Name</label>
                  <div className="relative">
                    <Building2 className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={16} />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={company.name || ""}
                      onChange={(e) => setCompany({ ...company, name: e.target.value })}
                      className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Website</label>
                  <div className="relative">
                    <Globe className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={16} />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={company.website || ""}
                      onChange={(e) => setCompany({ ...company, website: e.target.value })}
                      className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={16} />
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={company.contactInfo?.email || ""}
                      onChange={(e) =>
                        setCompany({ ...company, contactInfo: { ...company.contactInfo, email: e.target.value } })
                      }
                      className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2" size={16} />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={company.contactInfo?.phoneNumber || ""}
                      onChange={(e) =>
                        setCompany({ ...company, contactInfo: { ...company.contactInfo, phoneNumber: e.target.value } })
                      }
                      className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Office Address</label>
                  <div className="relative">
                    <MapPin className="top-3 left-3 absolute text-slate-400" size={16} />
                    <textarea
                      rows={3}
                      disabled={!isEditing}
                      value={company.contactInfo?.address || ""}
                      onChange={(e) =>
                        setCompany({ ...company, contactInfo: { ...company.contactInfo, address: e.target.value } })
                      }
                      className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm resize-none disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Bio / Description</label>
                  <div className="relative">
                    <Building2 className="top-3 left-3 absolute text-slate-400" size={16} />
                    <textarea
                      rows={3}
                      disabled={!isEditing}
                      value={company.bio || ""}
                      onChange={(e) => setCompany({ ...company, bio: e.target.value })}
                      className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm resize-none disabled:bg-slate-50 disabled:text-slate-500"
                      placeholder="Tell us about your company..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Legal documents */}
            <div className="bg-white shadow-sm p-8 border border-slate-100 rounded-2xl">
              <h3 className="mb-6 font-bold text-slate-900 text-lg">Legal Documents</h3>
              <div className="space-y-4">
                {/* Existing license document */}
                {company.licenseDocumentUrl ? (
                  <div className="group flex justify-between items-center hover:bg-slate-50 p-4 border border-slate-100 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Business License</p>
                        <p className="text-slate-500 text-xs">Uploaded verified document</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocModal({ url: company.licenseDocumentUrl, title: "Business License" })}
                      className="font-bold text-emerald-600 text-xs hover:underline"
                    >
                      View
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 border border-dashed border-slate-200 rounded-xl">
                    <ShieldCheck size={20} className="text-slate-300" />
                    <p className="text-slate-400 text-sm">No license document on file.</p>
                  </div>
                )}

                {/* New document preview if selected */}
                {documentFile && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <FileText size={16} className="text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-emerald-800 font-bold text-xs truncate">New document ready to upload</p>
                      <p className="text-emerald-600 text-xs truncate">{documentFile.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocumentFile(null)}
                      className="ml-auto text-emerald-500 hover:text-red-500 text-xs font-bold shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Upload area */}
                {isEditing && (
                  <label className="flex flex-col items-center gap-2 hover:bg-emerald-50/30 py-4 border-2 border-slate-200 hover:border-emerald-200 border-dashed rounded-2xl w-full text-slate-400 hover:text-emerald-500 transition-all cursor-pointer">
                    <Upload size={24} />
                    <span className="font-bold text-sm">
                      {company.licenseDocumentUrl ? "Replace License Document" : "Upload License Document"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
