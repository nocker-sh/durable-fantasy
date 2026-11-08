import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export function DropdownMenuTrigger(inputProps: MenuPrimitive.Trigger.Props) {
  const props = { ...inputProps }

  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}
