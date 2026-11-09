import { withoutKeys } from "#/lib/engine/without-keys"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "cn"

export function DropdownMenuItem(
  inputProps: MenuPrimitive.Item.Props & {
    inset?: boolean
    variant?: "default" | "destructive"
  },
) {
  const className = inputProps.className
  const inset = inputProps.inset
  const variantValue = inputProps.variant
  const variant = variantValue === undefined ? "default" : variantValue
  const props = withoutKeys(inputProps, ["className", "inset", "variant"])

  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-9.5 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className,
      )}
      {...props}
    />
  )
}
