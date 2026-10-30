import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export function DropdownMenuGroup(inputProps: MenuPrimitive.Group.Props) {
  const props = { ...inputProps }

  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}
