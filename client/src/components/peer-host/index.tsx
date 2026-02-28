import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Analytics } from "@/components/peer-host/analytics";
import { Overview } from "@/components/peer-host/overview";
import { RecentBooking } from "@/components/peer-host/recent-sales";
import { Download } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";

export function PeerHostDashboard() {
  return (
    <div className="flex flex-col flex-1 dark:bg-slate-950 overflow-hidden">
      <Header />
      <Main>
        <div className="flex justify-between items-center space-y-2">
          <h2 className="font-bold dark:text-white text-3xl tracking-tight">
            Dashboard
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              className="bg-white hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border dark:border-slate-700 text-black dark:text-white"
            >
              <Download className="mr-2 w-4 h-4" /> Download
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-muted/10 dark:bg-slate-800/50">
            <TabsTrigger 
              value="overview"
              className="dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white dark:text-slate-400"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white dark:text-slate-400"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white dark:text-slate-400"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              className="dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white dark:text-slate-400"
            >
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-4">
              {/* Total Earnings Card */}
              <Card className="bg-card dark:bg-slate-900 border-border/50 dark:border-slate-800 text-card-foreground">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                  <CardTitle className="font-medium dark:text-slate-300 text-sm">
                    Total Earnings
                  </CardTitle>
                  <span className="text-muted-foreground dark:text-slate-500">$</span>
                </CardHeader>
                <CardContent>
                  <div className="font-bold dark:text-white text-2xl">$45,231.89</div>
                  <p className="text-muted-foreground dark:text-slate-400 text-xs">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              {/* Active Listings Card */}
              <Card className="bg-card dark:bg-slate-900 border-border/50 dark:border-slate-800 text-card-foreground">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                  <CardTitle className="font-medium dark:text-slate-300 text-sm">
                    Active listings
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 text-muted-foreground dark:text-slate-500"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="font-bold dark:text-white text-2xl">+3</div>
                  <p className="text-muted-foreground dark:text-slate-400 text-xs">
                    All listings are active and performing well.
                  </p>
                </CardContent>
              </Card>

              {/* Pending Card */}
              <Card className="bg-card dark:bg-slate-900 border-border/50 dark:border-slate-800 text-card-foreground">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                  <CardTitle className="font-medium dark:text-slate-300 text-sm">
                    Pending
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 text-muted-foreground dark:text-slate-500"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="font-bold dark:text-white text-2xl">5</div>
                  <p className="text-muted-foreground dark:text-slate-400 text-xs">
                    Waiting for action from you.
                  </p>
                </CardContent>
              </Card>

              {/* Average Rating Card */}
              <Card className="bg-card dark:bg-slate-900 border-border/50 dark:border-slate-800 text-card-foreground">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                  <CardTitle className="font-medium dark:text-slate-300 text-sm">
                    Average Rating
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 text-muted-foreground dark:text-slate-500"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="font-bold dark:text-white text-2xl">4.9 stars</div>
                  <p className="text-muted-foreground dark:text-slate-400 text-xs">
                    User reviews are overwhelmingly positive.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-7">
              {/* Overview Card */}
              <Card className="col-span-4 bg-muted/5 dark:bg-slate-900/50 border-muted/20 dark:border-slate-800 text-black dark:text-white">
                <CardHeader>
                  <CardTitle className="dark:text-white">Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>

              {/* Recent Bookings Card */}
              <Card className="col-span-3 bg-muted/5 dark:bg-slate-900/50 border-muted/20 dark:border-slate-800 text-black dark:text-white">
                <CardHeader>
                  <CardTitle className="dark:text-white">Recent Bookings</CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-slate-400">
                    You have got 10 bookings this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentBooking />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Analytics />
          </TabsContent>
        </Tabs>
      </Main>
    </div>
  );
}