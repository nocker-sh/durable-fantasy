import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

export function Table(inputProps: React.ComponentProps<"table">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}
