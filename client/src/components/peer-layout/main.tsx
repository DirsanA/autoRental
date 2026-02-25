import { cn } from "@/lib/utils";

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
}

export function Main({ fixed, children, className, ...props }: MainProps) {
  return (
    <main
      className={cn(
        "flex flex-1 flex-col overflow-y-auto p-4 md:p-8 pt-6 bg-white dark:bg-black text-foreground border ",
        fixed && "h-full",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
