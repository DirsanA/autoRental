"use client";

import { Suspense } from "react";
import { P2PApprovalPageClient } from "./P2PApprovalPageClient";
import { AdminListPageSkeleton } from "@/components/system-admin/sysadmin-page-skeletons";

export default function P2PApprovalPage() {
  return (
    <Suspense fallback={<AdminListPageSkeleton stats={4} columns={8} rows={6} showHelperCard={false} />}>
      <P2PApprovalPageClient />
    </Suspense>
  );
}
