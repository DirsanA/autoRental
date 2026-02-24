import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  links: {
    title: string;
    href: string;
    isActive: boolean;
    disabled?: boolean;
  }[];
}

export function TopNav({ className, links, ...props }: TopNavProps) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {links.map((link) => (
        <Link
          key={link.title}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            link.isActive ? "text-white" : "text-muted-foreground",
            link.disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {link.title}
        </Link>
      ))}
    </nav>
  );
}
