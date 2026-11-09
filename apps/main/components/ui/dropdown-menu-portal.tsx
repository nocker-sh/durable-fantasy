import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export function DropdownMenuPortal(inputProps: MenuPrimitive.Portal.Props) {
  const props = { ...inputProps }

  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}
