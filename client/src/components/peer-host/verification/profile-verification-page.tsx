"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import type { VerificationSubmission, VerificationStatus } from "./types";

function statusVariant(
  status: VerificationStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
      return "destructive";
    case "not_submitted":
      return "outline";
  }
}

function statusLabel(status: VerificationStatus) {
  switch (status) {
    case "not_submitted":
      return "Not submitted";
    case "pending":
      return "Pending review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
  }
}

export function PeerHostProfileVerificationPage() {
  // Smart boundary: keep this page self-contained.
  // Later, replace local state with fetched submission + a real POST action.
  const [submission, setSubmission] = useState<VerificationSubmission>({
    status: "not_submitted",
    fullName: "",
    dateOfBirth: "",
    address: "",
    driverLicenseNumber: "",
    driverLicenseExpiry: "",
    documents: {},
  });

  const canSubmit = useMemo(() => {
    return (
      submission.fullName.trim().length > 2 &&
      submission.dateOfBirth &&
      submission.address.trim().length > 5 &&
      submission.driverLicenseNumber.trim().length > 4 &&
      submission.driverLicenseExpiry
    );
  }, [submission]);

  function submitForReview() {
    // In production: upload files to storage, then POST metadata to backend.
    setSubmission((prev) => ({
      ...prev,
      status: "pending",
      lastUpdatedAt: new Date().toISOString(),
      rejectionReason: undefined,
    }));
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <Main>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Profile & Verification
            </h2>
            <p className="text-sm text-muted-foreground">
              Submit your driver’s license and documents so we can approve your
              host profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(submission.status)}>
              {statusLabel(submission.status)}
            </Badge>
            <Button
              onClick={submitForReview}
              disabled={!canSubmit || submission.status === "pending"}
              className="bg-black text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
              Submit for approval
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Your details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={submission.fullName}
                  onChange={(e) =>
                    setSubmission((p) => ({ ...p, fullName: e.target.value }))
                  }
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={submission.dateOfBirth}
                    onChange={(e) =>
                      setSubmission((p) => ({ ...p, dateOfBirth: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expiry">License expiry</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={submission.driverLicenseExpiry}
                    onChange={(e) =>
                      setSubmission((p) => ({
                        ...p,
                        driverLicenseExpiry: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={submission.address}
                  onChange={(e) =>
                    setSubmission((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="Street, City, Country"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dl">Driver’s license number</Label>
                <Input
                  id="dl"
                  value={submission.driverLicenseNumber}
                  onChange={(e) =>
                    setSubmission((p) => ({
                      ...p,
                      driverLicenseNumber: e.target.value,
                    }))
                  }
                  placeholder="e.g. DL-123456"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {/* These inputs are placeholders for now.
                  Later you can switch them to real file upload components. */}
              <div className="grid gap-2">
                <Label htmlFor="dlFront">Driver’s license (front)</Label>
                <Input
                  id="dlFront"
                  value={submission.documents.driverLicenseFront ?? ""}
                  onChange={(e) =>
                    setSubmission((p) => ({
                      ...p,
                      documents: {
                        ...p.documents,
                        driverLicenseFront: e.target.value,
                      },
                    }))
                  }
                  placeholder="Paste file name or URL"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dlBack">Driver’s license (back)</Label>
                <Input
                  id="dlBack"
                  value={submission.documents.driverLicenseBack ?? ""}
                  onChange={(e) =>
                    setSubmission((p) => ({
                      ...p,
                      documents: {
                        ...p.documents,
                        driverLicenseBack: e.target.value,
                      },
                    }))
                  }
                  placeholder="Paste file name or URL"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="selfie">Selfie</Label>
                <Input
                  id="selfie"
                  value={submission.documents.selfie ?? ""}
                  onChange={(e) =>
                    setSubmission((p) => ({
                      ...p,
                      documents: { ...p.documents, selfie: e.target.value },
                    }))
                  }
                  placeholder="Paste file name or URL"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="poa">Proof of address</Label>
                <Input
                  id="poa"
                  value={submission.documents.proofOfAddress ?? ""}
                  onChange={(e) =>
                    setSubmission((p) => ({
                      ...p,
                      documents: {
                        ...p.documents,
                        proofOfAddress: e.target.value,
                      },
                    }))
                  }
                  placeholder="Paste file name or URL"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </div>
  );
}

