import { SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutGrid } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Search } from "@/components/dashboard/search";
import { ModeToggle } from "@/components/mode-toggle";
import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-white/95 dark:bg-black/95 px-4 backdrop-blur md:px-8">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <Button variant="ghost" size="icon">
          <LayoutGrid className="h-5 w-5" />
        </Button>
        <TopNav links={topNavLinks} className="hidden md:flex" />
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <Search />
        <ModeToggle />
        <ConfigDrawer />
        <ProfileDropdown />
      </div>
    </header>
  );
}

const topNavLinks = [
  {
    title: "Overview",
    href: "/dashboard",
    isActive: true,
  },
  {
    title: "Customers",
    href: "/customers",
    isActive: false,
    disabled: true,
  },
  {
    title: "Products",
    href: "/products",
    isActive: false,
    disabled: true,
  },
  {
    title: "Settings",
    href: "/settings",
    isActive: false,
    disabled: true,
  },
];
