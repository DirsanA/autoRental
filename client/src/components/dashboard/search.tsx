import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export function Search() {
  return (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search"
        className="h-9 w-[150px] pl-9 pr-12 lg:w-[300px] bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <div className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </div>
    </div>
  );
}
