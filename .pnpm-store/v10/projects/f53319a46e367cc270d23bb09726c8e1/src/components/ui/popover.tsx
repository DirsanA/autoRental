"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);

  if (!context) {
    throw new Error("Popover components must be used within <Popover>.");
  }

  return context;
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(node);
        return;
      }

      (ref as React.MutableRefObject<T | null>).current = node;
    });
  };
}

function composeClickHandlers(
  original?: React.MouseEventHandler<HTMLElement>,
  next?: React.MouseEventHandler<HTMLElement>,
) {
  return (event: React.MouseEvent<HTMLElement>) => {
    original?.(event);

    if (!event.defaultPrevented) {
      next?.(event);
    }
  };
}

type PopoverProps = {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Popover({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const open = openProp ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (openProp === undefined) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [openProp, onOpenChange],
  );

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider
      value={{ open, setOpen, triggerRef, contentRef }}
    >
      <div className="relative w-full">{children}</div>
    </PopoverContext.Provider>
  );
}

type PopoverTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export const PopoverTrigger = React.forwardRef<
  HTMLElement,
  PopoverTriggerProps
>(({ asChild = false, children, onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef } = usePopoverContext();

  const handleClick: React.MouseEventHandler<HTMLElement> = () => {
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;

    return React.cloneElement(child, {
      ...props,
      ref: mergeRefs(
        (child as { ref?: React.Ref<HTMLElement> }).ref,
        triggerRef,
        ref,
      ),
      onClick: composeClickHandlers(child.props.onClick, handleClick),
      "aria-expanded": open,
      "data-state": open ? "open" : "closed",
    });
  }

  return (
    <button
      type="button"
      {...props}
      ref={mergeRefs(triggerRef, ref)}
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      onClick={composeClickHandlers(onClick as React.MouseEventHandler<HTMLElement>, handleClick)}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

type PopoverContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
};

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverContentProps
>(
  (
    {
      align = "center",
      side = "bottom",
      sideOffset = 4,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { open, contentRef } = usePopoverContext();

    if (!open) return null;

    const positionClasses = {
      top: "bottom-full",
      right: "left-full top-1/2 -translate-y-1/2",
      bottom: "top-full",
      left: "right-full top-1/2 -translate-y-1/2",
    }[side];

    const alignClasses = {
      start: side === "top" || side === "bottom" ? "left-0" : "top-0",
      center:
        side === "top" || side === "bottom"
          ? "left-1/2 -translate-x-1/2"
          : "top-1/2 -translate-y-1/2",
      end: side === "top" || side === "bottom" ? "right-0" : "bottom-0",
    }[align];

    const spacingStyle =
      side === "bottom"
        ? { marginTop: sideOffset }
        : side === "top"
          ? { marginBottom: sideOffset }
          : side === "right"
            ? { marginLeft: sideOffset }
            : { marginRight: sideOffset };

    return (
      <div
        {...props}
        ref={mergeRefs(contentRef, ref)}
        role="dialog"
        className={cn(
          "absolute z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
          positionClasses,
          alignClasses,
          className,
        )}
        style={{ ...spacingStyle, ...style }}
      >
        {children}
      </div>
    );
  },
);
PopoverContent.displayName = "PopoverContent";
