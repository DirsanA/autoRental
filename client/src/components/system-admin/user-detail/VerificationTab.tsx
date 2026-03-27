"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileCheck2, ShieldCheck, ShieldX } from "lucide-react";
import type { UserFullDetail } from "./types";
import { formatDateTime, formatLabel } from "./formatters";

interface VerificationTabProps {
  user: UserFullDetail;
}

function countByStatus(user: UserFullDetail, status: string) {
  return user.verifications.filter((item) => item.status === status).length;
}

/**
 * Shows verification summary data and recent verification submissions.
 */
export function VerificationTab({ user }: VerificationTabProps) {
  const approvedCount = countByStatus(user, "APPROVED");
  const pendingCount = countByStatus(user, "PENDING");
  const rejectedCount = countByStatus(user, "REJECTED");

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Verification level</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {formatLabel(user.verificationLevel)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Current verification level stored on the user profile.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total requests</CardDescription>
            <CardTitle className="text-2xl">
              {user.metrics.verificationRequests}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Aggregate count of verification records linked to this user.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Recent approvals</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileCheck2 className="h-5 w-5 text-emerald-600" />
              {approvedCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Approved cases within the recent verification records loaded here.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Needs review</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ShieldX className="h-5 w-5 text-amber-600" />
              {pendingCount + rejectedCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Pending and rejected recent submissions that may need follow-up.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Verification Records</CardTitle>
          <CardDescription>
            Latest verification cases from the current verification collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.verifications.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
              No verification records were found for this user.
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Submitted</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reviewed</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Admin comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.verifications.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell className="whitespace-nowrap font-medium">
                        {formatDateTime(verification.createdAt)}
                      </TableCell>
                      <TableCell>{formatLabel(verification.documentType)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {formatLabel(verification.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(verification.verifiedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="font-normal">
                            {verification.documentFrontUrl ? "Front" : "No front"}
                          </Badge>
                          <Badge variant="secondary" className="font-normal">
                            {verification.documentBackUrl ? "Back" : "No back"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[320px] text-sm text-muted-foreground">
                        {verification.adminComment || "No admin comment"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
