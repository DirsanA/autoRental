import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Analytics } from "@/components/dashboard/analytics";
import { Overview } from "@/components/dashboard/overview";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { Download } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";

export function PeerHostDashboard() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header />
      <Main>
        <div className="flex justify-between items-center space-y-2">
          <h2 className="font-bold text-3xl tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              className="bg-white hover:bg-gray-200 text-black"
            >
              <Download className="mr-2 w-4 h-4" /> Download
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-muted/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card border-border/50 text-card-foreground">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Total Revenue
                  </CardTitle>
                  <span className="text-muted-foreground">$</span>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">$45,231.89</div>
                  <p className="text-muted-foreground text-xs">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50 text-card-foreground">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Subscriptions
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">+2350</div>
                  <p className="text-muted-foreground text-xs">
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50 text-card-foreground">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">Sales</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">+12,234</div>
                  <p className="text-muted-foreground text-xs">
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50 text-card-foreground">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Active Now
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">+573</div>
                  <p className="text-muted-foreground text-xs">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 bg-muted/5 border-muted/20 text-black dark:text-white">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3 bg-muted/5 border-muted/20 text-black dark:text-white">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
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
