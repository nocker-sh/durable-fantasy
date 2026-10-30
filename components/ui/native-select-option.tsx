import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function NativeSelectOption(inputProps: React.ComponentProps<"option">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <option data-slot="native-select-option" className={cn("bg-[Canvas] text-[CanvasText]", className)} {...props} />
}
