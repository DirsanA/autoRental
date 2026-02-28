"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { 
  Upload, 
  Shield, 
  CheckCircle2, 
  Clock,
  X,
  FileText,
  IdCard
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "not_submitted" | "pending" | "approved";

interface UploadedFile {
  file: File;
  preview: string;
  type: "front" | "back";
}

export function PeerHostProfileVerificationPage() {
  const [status, setStatus] = useState<Status>("not_submitted");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    licenseNumber: "",
    expiry: "",
  });

  const canSubmit = useMemo(() => {
    return (
      form.fullName.length > 2 &&
      form.dob &&
      form.licenseNumber.length > 4 &&
      form.expiry &&
      uploadedFiles.length === 2
    );
  }, [form, uploadedFiles]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        const type = uploadedFiles.length === 0 ? "front" : "back";
        
        setUploadedFiles(prev => [
          ...prev, 
          { file, preview, type }
        ]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeFile(index: number) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    setStatus("pending");
  }

  function statusBadge() {
    if (status === "approved")
      return (
        <Badge className="gap-1 bg-emerald-600 dark:bg-emerald-500 text-white">
          <CheckCircle2 className="w-3 h-3" />
          Approved
        </Badge>
      );

    if (status === "pending")
      return (
        <Badge variant="secondary" className="gap-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
          <Clock className="w-3 h-3" />
          Pending Review
        </Badge>
      );

    return <Badge variant="outline" className="dark:border-slate-700 dark:text-slate-400">Not Submitted</Badge>;
  }

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-slate-50 dark:from-slate-950 to-white dark:to-slate-900 overflow-hidden">
      <Header />
      
      <Main className="mx-auto px-4 py-8 max-w-5xl container">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 dark:from-blue-600 to-indigo-600 dark:to-indigo-700 shadow-lg p-2 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="bg-clip-text bg-gradient-to-r from-slate-900 dark:from-slate-100 to-slate-600 dark:to-slate-400 font-bold text-transparent text-3xl">
                Profile Verification
              </h1>
              <p className="text-muted-foreground dark:text-slate-400 text-sm">
                Submit your driver's license for verification
              </p>
            </div>
          </div>
          {statusBadge()}
        </div>

        {/* Grid Layout */}
        <div className="gap-6 grid md:grid-cols-2">
          {/* Form Card */}
          <Card className="bg-white/80 dark:bg-slate-900/80 shadow-xl backdrop-blur dark:border border-0 dark:border-slate-800">
            <CardHeader className="border-slate-200 dark:border-slate-800 border-b">
              <CardTitle className="flex items-center gap-2 dark:text-slate-200 text-base">
                <IdCard className="w-4 h-4" />
                Driver Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground dark:text-slate-400 text-xs">Full Name</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="bg-slate-100 dark:bg-slate-800 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 dark:placeholder:text-slate-500 dark:text-slate-200"
                />
              </div>

              <div className="gap-3 grid grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground dark:text-slate-400 text-xs">Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="bg-slate-100 dark:bg-slate-800 border-0 dark:text-slate-200 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground dark:text-slate-400 text-xs">License Expiry</Label>
                  <Input
                    type="date"
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    className="bg-slate-100 dark:bg-slate-800 border-0 dark:text-slate-200 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground dark:text-slate-400 text-xs">License Number</Label>
                <Input
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  placeholder="DL-123456"
                  className="bg-slate-100 dark:bg-slate-800 border-0 dark:placeholder:text-slate-500 dark:text-slate-200"
                />
              </div>

              <Button
                disabled={!canSubmit || status === "pending"}
                onClick={handleSubmit}
                className="bg-gradient-to-r from-slate-900 hover:from-slate-800 dark:from-blue-600 dark:hover:from-blue-700 to-slate-800 hover:to-slate-700 dark:hover:to-blue-800 dark:to-blue-700 shadow-lg w-full text-white"
              >
                {status === "pending" ? (
                  <>Submitted for Review</>
                ) : (
                  <>Submit for Verification</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Upload Card */}
          <Card className="bg-white/80 dark:bg-slate-900/80 shadow-xl backdrop-blur dark:border border-0 dark:border-slate-800">
            <CardHeader className="border-slate-200 dark:border-slate-800 border-b">
              <CardTitle className="flex items-center gap-2 dark:text-slate-200 text-base">
                <Upload className="w-4 h-4" />
                License Upload
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 p-6">
              {/* Upload Area */}
              {uploadedFiles.length < 2 && (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    disabled={uploadedFiles.length >= 2}
                  />
                  <div className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 p-8 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl text-center transition-colors">
                    <Upload className="mx-auto mb-2 w-8 h-8 text-slate-400 dark:text-slate-500" />
                    <p className="font-medium dark:text-slate-300 text-sm">
                      {uploadedFiles.length === 0 ? "Upload Front of License" : "Upload Back of License"}
                    </p>
                    <p className="mt-1 text-muted-foreground dark:text-slate-400 text-xs">
                      Click to browse (JPG, PNG, PDF)
                    </p>
                  </div>
                </div>
              )}

              {/* Preview Grid */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <p className="font-medium text-muted-foreground dark:text-slate-400 text-xs">UPLOADED FILES</p>
                  <div className="gap-3 grid">
                    {uploadedFiles.map((file, index) => (
                      <div 
                        key={index}
                        className="group flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl"
                      >
                        <div className="flex justify-center items-center bg-white dark:bg-slate-700 rounded-lg w-12 h-12 overflow-hidden">
                          {file.file.type.startsWith('image/') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={file.preview} 
                              alt={file.file.name}
                              className="dark:brightness-90 w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="px-1 py-0 dark:border-slate-600 text-[10px] dark:text-slate-300">
                              {file.type === "front" ? "FRONT" : "BACK"}
                            </Badge>
                            <p className="font-medium dark:text-slate-300 text-sm truncate">{file.file.name}</p>
                          </div>
                          <p className="text-muted-foreground dark:text-slate-400 text-xs">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 rounded-full w-8 h-8 dark:text-slate-400 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* Upload More Button */}
                    {uploadedFiles.length === 1 && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 p-3 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl text-muted-foreground dark:text-slate-400 text-sm text-center transition-colors">
                          + Upload back side
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="bg-blue-50 dark:bg-blue-950/50 p-3 border border-blue-100 dark:border-blue-900 rounded-lg text-blue-700 dark:text-blue-300 text-xs">
                <p className="mb-1 font-medium">📋 Requirements:</p>
                <ul className="space-y-0.5 text-blue-600 dark:text-blue-400 list-disc list-inside">
                  <li>Clear photo of both front and back</li>
                  <li>All text must be readable</li>
                  <li>Max file size: 5MB each</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between items-center mt-6 text-muted-foreground dark:text-slate-400 text-xs">
          <div className="flex items-center gap-2">
            <div className={cn(
              "rounded-full w-2 h-2 transition-colors",
              form.fullName ? "bg-green-500 dark:bg-green-400" : "bg-slate-300 dark:bg-slate-600"
            )} />
            <span>Personal info</span>
          </div>
          <div className="flex-1 bg-slate-200 dark:bg-slate-700 mx-2 h-px" />
          <div className="flex items-center gap-2">
            <div className={cn(
              "rounded-full w-2 h-2 transition-colors",
              uploadedFiles.length === 2 ? "bg-green-500 dark:bg-green-400" : "bg-slate-300 dark:bg-slate-600"
            )} />
            <span>Documents ({uploadedFiles.length}/2)</span>
          </div>
        </div>
      </Main>
    </div>
  );
}