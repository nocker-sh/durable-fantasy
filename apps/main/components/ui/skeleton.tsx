import { withoutKeys } from "#/lib/engine/without-keys"
import { cn } from "cn"

function Skeleton(inputProps: React.ComponentProps<"div">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return <div data-slot="skeleton" className={cn("animate-pulse rounded-xl bg-muted", className)} {...props} />
}

export { Skeleton }
