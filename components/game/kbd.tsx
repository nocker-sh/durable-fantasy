// Copied from the dev shadcn Kbd: a small keycap for shortcut hints.
import { cn } from "cn"

function Kbd({ className, children, ...props }: React.ComponentProps<"kbd">) {
  // key names in Latin letters use the 8px pixel face; anything else the heading face
  const latin = typeof children === "string" && /^[\x20-\x7e]+$/.test(children)
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-4 min-w-4 items-center justify-center rounded bg-white/10 px-1 leading-none text-text-dim select-none",
        latin ? "font-tiny text-[9px]" : "font-head text-[10px]",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}

export { Kbd }
