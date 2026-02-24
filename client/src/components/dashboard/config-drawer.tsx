import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings } from "lucide-react";

export function ConfigDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Toggle settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configuration</SheetTitle>
          <SheetDescription>
            Adjust your dashboard settings and preferences here.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {/* Add configuration options here if needed */}
          <p className="text-sm text-muted-foreground">
            Settings options will appear here.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
