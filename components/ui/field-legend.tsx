import { withoutKeys } from "#/lib/engine/without-keys"
import { cn } from "cn"

export function FieldLegend(inputProps: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  const className = inputProps.className
  const variantValue = inputProps.variant
  const variant = variantValue === undefined ? "legend" : variantValue
  const props = withoutKeys(inputProps, ["className", "variant"])

  return <legend data-slot="field-legend" data-variant={variant} className={cn("mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base", className)} {...props} />
}
