import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function DropdownMenuShortcut(inputProps: React.ComponentProps<"span">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <span data-slot="dropdown-menu-shortcut" className={cn("ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground", className)} {...props} />
}
