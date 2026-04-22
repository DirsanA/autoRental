"use client";

import { Suspense } from "react";
import { P2PApprovalPageClient } from "./P2PApprovalPageClient";

export default function P2PApprovalPage() {
  return (
    <Suspense fallback={null}>
      <P2PApprovalPageClient />
    </Suspense>
  );
}
