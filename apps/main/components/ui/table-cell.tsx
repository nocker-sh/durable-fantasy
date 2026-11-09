import { withoutKeys } from "#/lib/engine/without-keys"
import * as React from "react"
import { cn } from "cn"

/** A cell never wraps (the table scrolls sideways instead); a long one is cut short with "…" and shows in full on hover. */
export function TableCell(inputProps: React.ComponentProps<"td">) {
  const className = inputProps.className
  const title = inputProps.title
  const children = inputProps.children
  const props = withoutKeys(inputProps, ["className", "title", "children"])

  return (
    <td
      data-slot="table-cell"
      title={title ?? (typeof children === "string" ? children : undefined)}
      className={cn("p-3 align-middle [&:has([role=checkbox])]:pr-0", className, "overflow-hidden text-ellipsis whitespace-nowrap")}
      {...props}
    >
      {children}
    </td>
  )
}
