"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import Image from "next/image";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { buildAuthHeader } from "@/lib/auth-token";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = resolveApiBaseUrl();

type CompanyProfile = {
  id?: string;
  _id?: string;
  status?: string;
  pendingChanges?: Record<string, unknown>;
  logoUrl?: string | null;
  name?: string;
  category?: string | null;
  website?: string | null;
  contactInfo?: {
    email?: string;
    phoneNumber?: string;
    address?: string | null;
  };
  licenseDocumentUrl?: string | null;
  [key: string]: unknown;
};

export default function Profile() {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const hasPendingChanges = Boolean(company?.pendingChanges);
  const isPendingApproval = company?.status !== "ACTIVE" || hasPendingChanges;
  const {toast} = useToast();
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/companies/me`, {
      credentials: "include",
      headers: {
        ...buildAuthHeader(),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCompany(data.data.company);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }

    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [logoFile]);

  const handleSave = async () => {
    if (!company) return;
    try {
      const companyId = company.id || company._id;
      if (!companyId) {
        throw new Error("Unable to determine company id");
      }

      const formData = new FormData();
      if (company.name) {
        formData.append("name", company.name);
      }
      if (company.website) {
        formData.append("website", company.website);
      }
      if (company.contactInfo?.email) {
        formData.append("contactInfo[email]", company.contactInfo.email);
      }
      if (company.contactInfo?.phoneNumber) {
        formData.append(
          "contactInfo[phoneNumber]",
          company.contactInfo.phoneNumber,
        );
      }
      if (company.contactInfo?.address) {
        formData.append("contactInfo[address]", company.contactInfo.address);
      }

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (documentFile) {
        formData.append("licenseDocument", documentFile);
      }

      const res = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          ...buildAuthHeader(),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to update profile");

     toast({
        title: "Profile update submitted",
        description: isPendingApproval
          ? "Your changes are pending admin approval. Existing approved profile remains active until review completes."
          : "Your profile has been updated successfully.",
     })
      setCompany(data.data.company);
      setLogoFile(null);
      setDocumentFile(null);
    } catch (error: unknown) {
      toast({
        title: "Error updating profile",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating your profile.",
        variant: "destructive",
      })
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        return alert("Passwords do not match");
      }

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
      if (!res.ok) throw new Error(data.message);

     toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      })

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      toast({
        title: "Error changing password",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while changing your password.",
        variant: "destructive",
      });
    }
  };

  if (loading || !company) return <div>Loading...</div>;
  return (
    <div className="space-y-8 mx-auto max-w-4xl">
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-900 text-2xl">Company Profile</h2>
          <p className="text-slate-500">
            Manage your business information and verification status.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 shadow-lg px-6 py-2 rounded-xl w-full sm:w-auto font-bold text-white transition-colors"
        >
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>
      {isPendingApproval && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
          Your profile changes are pending admin approval. Existing approved data
          remains active until the review completes.
        </div>
      )}
      <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <div className="bg-white shadow-sm p-6 border border-slate-100 rounded-2xl text-center">
            <div className="inline-block relative mb-4">
              <div className="flex justify-center items-center bg-slate-100 shadow-md border-4 border-white rounded-3xl w-32 h-32 overflow-hidden">
                {logoPreview || company.logoUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={logoPreview || (company.logoUrl as string)}
                      alt="Company logo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <Building2 size={48} className="text-slate-300" />
                )}
              </div>
              <input
                id="company-logo-upload"
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setLogoFile(file);
                }}
              />
              <label
                htmlFor="company-logo-upload"
                className="-right-2 -bottom-2 absolute inline-flex cursor-pointer bg-white shadow-lg p-2 border border-slate-100 rounded-xl text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                <Upload size={18} />
              </label>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{company.name}</h3>
            <p className="text-slate-500 text-sm">
              {" "}
              {company.category || "Business"}
            </p>

            <div
              className={`flex justify-center items-center gap-2 mt-6 px-3 py-1.5 rounded-full font-bold text-xs ${company.status === "ACTIVE" ? "bg-emerald-50 border border-emerald-100 text-emerald-600" : "bg-amber-50 border border-amber-200 text-amber-700"}`}
            >
              <ShieldCheck size={14} />
              <span>
                {company.status === "ACTIVE"
                  ? "Verified Business"
                  : "Pending Verification"}
              </span>
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 border border-slate-100 rounded-2xl">
            <h4 className="mb-4 font-bold text-slate-900 text-sm">
              Verification Status
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">Company approval</span>
                <span
                  className={`font-bold text-xs ${company.status === "ACTIVE" ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {company.status === "ACTIVE"
                    ? "Approved"
                    : "Pending Approval"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">Legal document</span>
                <span
                  className={`font-bold text-xs ${company.licenseDocumentUrl ? "text-emerald-600" : "text-slate-500"}`}
                >
                  {company.licenseDocumentUrl ? "Uploaded" : "Not uploaded"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">Profile picture</span>
                <span
                  className={`font-bold text-xs ${company.logoUrl ? "text-emerald-600" : "text-slate-500"}`}
                >
                  {company.logoUrl ? "Uploaded" : "Not uploaded"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:col-span-2">
          <div className="bg-white shadow-sm p-8 border border-slate-100 rounded-2xl">
            <h3 className="mb-6 font-bold text-slate-900 text-lg">
              General Information
            </h3>
            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Company Name
                </label>
                <div className="relative">
                  <Building2
                    className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2"
                    size={16}
                  />
                  <input
                    type="text"
                    value={company.name || ""}
                    onChange={(e) =>
                      setCompany({ ...company, name: e.target.value })
                    }
                    className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Website
                </label>
                <div className="relative">
                  <Globe
                    className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2"
                    size={16}
                  />
                  <input
                    type="text"
                    value={company.website || ""}
                    onChange={(e) =>
                      setCompany({ ...company, website: e.target.value })
                    }
                    className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2"
                    size={16}
                  />
                  <input
                    type="email"
                    value={company?.contactInfo?.email || ""}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        contactInfo: {
                          ...company.contactInfo,
                          email: e.target.value,
                        },
                      })
                    }
                    className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2"
                    size={16}
                  />
                  <input
                    type="text"
                    value={company?.contactInfo?.phoneNumber || ""}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        contactInfo: {
                          ...company.contactInfo,
                          phoneNumber: e.target.value,
                        },
                      })
                    }
                    className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Office Address
                </label>
                <div className="relative">
                  <MapPin
                    className="top-3 left-3 absolute text-slate-400"
                    size={16}
                  />
                  <textarea
                    rows={3}
                    value={company?.contactInfo?.address || ""}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        contactInfo: {
                          ...company.contactInfo,
                          address: e.target.value,
                        },
                      })
                    }
                    className="py-2 pr-4 pl-10 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 w-full text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-sm p-8 border border-slate-100 rounded-2xl">
            <h3 className="mb-6 font-bold text-slate-900 text-lg">
              Change Password
            </h3>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm pr-10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({
                      ...showPassword,
                      current: !showPassword.current,
                    })
                  }
                  className="top-1/2 right-3 absolute text-slate-400 -translate-y-1/2"
                >
                  {showPassword.current ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm pr-10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({ ...showPassword, new: !showPassword.new })
                  }
                  className="top-1/2 right-3 absolute text-slate-400 -translate-y-1/2"
                >
                  {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm pr-10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({
                      ...showPassword,
                      confirm: !showPassword.confirm,
                    })
                  }
                  className="top-1/2 right-3 absolute text-slate-400 -translate-y-1/2"
                >
                  {showPassword.confirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <button
                onClick={handlePasswordChange}
                className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl w-full text-white font-bold"
              >
                Update Password
              </button>
            </div>
          </div>
          <div className="bg-white shadow-sm p-8 border border-slate-100 rounded-2xl">
            <h3 className="mb-6 font-bold text-slate-900 text-lg">
              Legal Documents
            </h3>
            <div className="space-y-4">
              <div className="group flex flex-col gap-4 p-4 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      Business License
                    </p>
                    <p className="text-slate-500 text-xs">
                      {company.licenseDocumentUrl
                        ? "Uploaded and pending review"
                        : "No document uploaded yet"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  {company.licenseDocumentUrl ? (
                    <a
                      href={company.licenseDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-emerald-600 text-xs hover:underline"
                    >
                      View Document
                    </a>
                  ) : null}
                  <div className="text-slate-500 text-xs">
                    {documentFile
                      ? documentFile.name
                      : "Select a PDF or image to replace the license"}
                  </div>
                </div>
              </div>

              <input
                id="company-document-upload"
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setDocumentFile(file);
                }}
              />
              <label
                htmlFor="company-document-upload"
                className="flex flex-col items-center gap-2 hover:bg-emerald-50/30 py-4 border-2 border-slate-200 hover:border-emerald-200 border-dashed rounded-2xl w-full text-slate-400 hover:text-emerald-500 transition-all cursor-pointer"
              >
                <Upload size={24} />
                <span className="font-bold text-sm">Upload New Document</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
