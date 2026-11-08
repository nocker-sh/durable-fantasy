import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export function DropdownMenuSub(inputProps: MenuPrimitive.SubmenuRoot.Props) {
  const props = { ...inputProps }

  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}
