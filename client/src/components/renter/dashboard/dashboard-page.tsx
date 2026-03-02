"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RenterDashboardPage() {
  return (
    <div className="flex flex-col flex-1 dark:bg-slate-950 overflow-hidden">
      <Header />

      <Main>
        <div className="mb-8">
          <h2 className="font-bold dark:text-white text-3xl tracking-tight">
            Renter Dashboard
          </h2>
          <p className="mt-2 text-muted-foreground dark:text-slate-400 text-sm">
            Your bookings, verification status, and renter tools live here.
          </p>
        </div>

        <div className="gap-6 grid md:grid-cols-2">
          <Card className="dark:bg-slate-900 border-border/50 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground dark:text-slate-400 text-sm">
              This is a placeholder renter dashboard page. Add renter analytics
              and actions here later.
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-900 border-border/50 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Next Trip</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground dark:text-slate-400 text-sm">
              Show upcoming reservations here.
            </CardContent>
          </Card>
        </div>
      </Main>
    </div>
  );
}

