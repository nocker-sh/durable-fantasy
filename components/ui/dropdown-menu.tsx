import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export function DropdownMenu(inputProps: MenuPrimitive.Root.Props) {
  const props = { ...inputProps }

  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}
