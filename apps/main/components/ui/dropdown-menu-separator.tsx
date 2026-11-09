import { withoutKeys } from "#/lib/engine/without-keys"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "cn"

export function DropdownMenuSeparator(inputProps: MenuPrimitive.Separator.Props) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <MenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("-mx-1 my-1 h-px bg-border/50", className)} {...props} />
}
