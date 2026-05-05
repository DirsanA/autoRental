"use client";

import * as React from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);
  //
  if (!mounted) {
    return (
      <Button
        variant="outline"
        className="bg-background/80 shadow-sm px-3 border-border/70 rounded-full h-10"
        disabled
      >
        <Sun className="w-4 h-4" />
        <span className="font-medium text-sm">Theme</span>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const isDarkMode = activeTheme === "dark";

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="relative bg-background/80 hover:bg-accent/70 shadow-sm px-3 border-border/70 rounded-full h-10"
        >
          <span className="relative flex justify-center items-center">
            <Sun
              className="w-3.5 h-3.5 rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all"
            />
            <Moon
              className="absolute w-3.5 h-3.5 rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all"
            />
          </span>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={5}
        className="z-[9999] bg-white dark:bg-background shadow-xl p-1.5 border-border/70 rounded-2xl w-44"
      >
        {options.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setTheme(value)}
            className="flex justify-between items-center px-3 py-2.5 rounded-xl"
          >
            <span className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span>{label}</span>
            </span>
            {theme === value ? <Check className="w-4 h-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
