import { withoutKeys } from "#/lib/engine/without-keys"
import { cn } from "cn"

export function FieldSet(inputProps: React.ComponentProps<"fieldset">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <fieldset data-slot="field-set" className={cn("flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3", className)} {...props} />
}
