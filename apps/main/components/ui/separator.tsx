import { withoutKeys } from "#/lib/engine/without-keys"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cn } from "cn"

function Separator(inputProps: SeparatorPrimitive.Props) {
  const className = inputProps.className
  const orientationValue = inputProps.orientation
  const orientation = orientationValue === undefined ? "horizontal" : orientationValue
  const props = withoutKeys(inputProps, ["className", "orientation"])

  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn("shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch", className)}
      {...props}
    />
  )
}

export { Separator }
