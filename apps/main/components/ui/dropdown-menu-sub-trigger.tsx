import { withoutKeys } from "#/lib/engine/without-keys"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "cn"
import { ChevronRight } from "lucide-react"

export function DropdownMenuSubTrigger(
  inputProps: MenuPrimitive.SubmenuTrigger.Props & {
    inset?: boolean
  },
) {
  const className = inputProps.className
  const inset = inputProps.inset
  const children = inputProps.children
  const props = withoutKeys(inputProps, ["className", "inset", "children"])

  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-xl px-3 py-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-9.5 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight strokeWidth={2} className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}
