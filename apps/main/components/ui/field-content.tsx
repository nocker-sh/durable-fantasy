import { withoutKeys } from "#/lib/engine/without-keys"
import { cn } from "cn"

export function FieldContent(inputProps: React.ComponentProps<"div">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <div data-slot="field-content" className={cn("group/field-content flex flex-1 flex-col gap-1 leading-snug", className)} {...props} />
}
