import { withoutKeys } from "#/lib/engine/without-keys"
import { cn } from "cn"

export function FieldGroup(inputProps: React.ComponentProps<"div">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return (
    <div
      data-slot="field-group"
      className={cn("group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4", className)}
      {...props}
    />
  )
}
