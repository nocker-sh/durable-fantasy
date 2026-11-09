import { withoutKeys } from "#/lib/engine/without-keys"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "cn"

export function DropdownMenuLabel(
  inputProps: MenuPrimitive.GroupLabel.Props & {
    inset?: boolean
  },
) {
  const className = inputProps.className
  const inset = inputProps.inset
  const props = withoutKeys(inputProps, ["className", "inset"])

  return <MenuPrimitive.GroupLabel data-slot="dropdown-menu-label" data-inset={inset} className={cn("px-3 py-2.5 text-xs text-muted-foreground data-inset:pl-9.5", className)} {...props} />
}
