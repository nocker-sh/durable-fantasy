import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export function DropdownMenuRadioGroup(inputProps: MenuPrimitive.RadioGroup.Props) {
  const props = { ...inputProps }

  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}
