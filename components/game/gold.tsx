// An amount of gold with a pixel coin.
import { cn } from "cn"
import { uiIconUrl } from "#/world/art/ui-icon-url"

function Gold(inputProps: { amount: number; className?: string }) {
  const amount = inputProps.amount
  const className = inputProps.className

  return (
    <span className={cn("inline-flex items-center gap-1 font-head tabular-nums", className)}>
      <img aria-hidden src={uiIconUrl("coin", 16)} alt="" className="size-4" />
      {amount.toLocaleString("ja-JP")}
      <span className="text-[0.85em] text-text-dim">G</span>
    </span>
  )
}

export { Gold }
