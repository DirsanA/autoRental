import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { ChapaReturnClient } from "./return-client";

export default function ChapaReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dcfce7,transparent_32%),linear-gradient(180deg,#f8fafc,#ffffff)] px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center gap-3 text-slate-700">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading payment status...
            </div>
          </div>
        </main>
      }
    >
      <ChapaReturnClient />
    </Suspense>
  );
}
