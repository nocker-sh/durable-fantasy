import { withoutKeys } from "#/lib/engine/without-keys"
import { cn } from "cn"

export function FieldTitle(inputProps: React.ComponentProps<"div">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <div data-slot="field-label" className={cn("flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50", className)} {...props} />
}
