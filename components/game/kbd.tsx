import { withoutKeys } from "#/lib/engine/without-keys"
// Copied from the dev shadcn Kbd: a small keycap for shortcut hints.
import { cn } from "cn"

function Kbd(inputProps: React.ComponentProps<"kbd">) {
  const className = inputProps.className
  const children = inputProps.children
  const props = withoutKeys(inputProps, ["className", "children"])

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
