import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function NativeSelectOptGroup(inputProps: React.ComponentProps<"optgroup">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <optgroup data-slot="native-select-optgroup" className={cn("bg-[Canvas] text-[CanvasText]", className)} {...props} />
}
