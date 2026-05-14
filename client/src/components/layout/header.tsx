import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";

export function Header() {
  return (
    <header className="top-0 z-10 sticky flex items-center bg-white/95 dark:bg-black/95 backdrop-blur px-4 md:px-8 border-b h-16">
      <div className="flex items-center space-x-4">
        {/** display the sidebarTrigger here only in mobile screen */}
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
      </div>
      <div className="flex justify-end space-x-4 ml-auto">
        <ModeToggle />
        <ProfileDropdown />
      </div>
    </header>
  );
}
