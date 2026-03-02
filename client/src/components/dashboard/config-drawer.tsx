"use client";

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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function ConfigDrawer() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [view, setView] = useState("list");
  const [accent, setAccent] = useState("blue");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Toggle settings</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-100">
        <SheetHeader>
          <SheetTitle>Configuration</SheetTitle>
          <SheetDescription>
            Adjust your dashboard settings and preferences here.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="darkMode">Dark Mode</Label>
            <Switch
              id="darkMode"
              checked={darkMode}
              onCheckedChange={(val) => setDarkMode(val)}
            />
          </div>

          {/* Default View */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="view">Default View</Label>
            <Select value={view} onValueChange={setView}>
              <SelectTrigger id="view" className="w-full">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Notifications</Label>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={(val) => setNotifications(val)}
            />
          </div>

          {/* Accent Color */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="accent">Accent Color</Label>
            <Select value={accent} onValueChange={setAccent}>
              <SelectTrigger id="accent" className="w-full">
                <SelectValue placeholder="Select accent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="zinc">Zinc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Save Button */}
          <Button className="mt-4" onClick={() => alert("Settings saved!")}>
            Save Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
