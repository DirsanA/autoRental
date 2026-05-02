"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarLoadingSkeleton() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const skeletonClass = "bg-black/20 dark:bg-white/20";

  return (
    <>
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between",
        )}
      >
        <div className="flex items-center gap-2">
          <Skeleton className={cn("h-8 w-8 rounded-lg", skeletonClass)} />
          {!isCollapsed && (
            <Skeleton className={cn("h-4 w-24", skeletonClass)} />
          )}
        </div>

        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 py-4">
        <SidebarMenu>
          {Array.from({ length: 5 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <div className="flex h-8 items-center gap-2 rounded-md px-2">
                <Skeleton className={cn("size-4 rounded-md", skeletonClass)} />
                {!isCollapsed && (
                  <Skeleton
                    className={cn(
                      "h-4 flex-1 rounded-md",
                      index % 2 === 0 ? "max-w-[82%]" : "max-w-[64%]",
                      skeletonClass,
                    )}
                  />
                )}
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-12 items-center gap-2 rounded-md px-2">
              <Skeleton className={cn("size-8 rounded-lg", skeletonClass)} />
              {!isCollapsed && (
                <div className="grid flex-1 gap-1.5">
                  <Skeleton className={cn("h-3 w-24 rounded-md", skeletonClass)} />
                  <Skeleton className={cn("h-2.5 w-16 rounded-md", skeletonClass)} />
                </div>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
