import { withoutKeys } from "#/lib/engine/without-keys"
// An item slot (ui.md §6.5): 48px, edged in the item's rarity colour, an icon, a count and a key.
import { forwardRef } from "react"
import { cn } from "cn"
import type { Rarity } from "#/world/core/items/kinds"

const RARITY: Record<Rarity, string> = {
  common: "var(--color-rarity-common)",
  fine: "var(--color-rarity-fine)",
  rare: "var(--color-rarity-rare)",
  treasure: "var(--color-rarity-treasure)",
}

type SlotProps = React.ComponentProps<"button"> & {
  icon?: string | null
  rarity?: Rarity
  count?: number
  /** key that uses this slot */
  keyHint?: string
  /** dim the icon (none left, or cannot be afforded) */
  dim?: boolean
  /** highlighted as a drop target or selected */
  over?: boolean
  /** what an empty slot is for (装備欄: 頭, 武器…), as text */
  placeholder?: string
  /** …or as a dim silhouette */
  emptyIcon?: string
  /** a round, see-through shortcut (the bar along the bottom) */
  round?: boolean
}

const Slot = forwardRef<HTMLButtonElement, SlotProps>(function Slot(inputProps, ref) {
  const icon = inputProps.icon
  const rarity = inputProps.rarity
  const count = inputProps.count
  const keyHint = inputProps.keyHint
  const dim = inputProps.dim
  const over = inputProps.over
  const placeholder = inputProps.placeholder
  const emptyIcon = inputProps.emptyIcon
  const round = inputProps.round
  const className = inputProps.className
  const children = inputProps.children
  const style = inputProps.style
  const props = withoutKeys(inputProps, ["icon", "rarity", "count", "keyHint", "dim", "over", "placeholder", "emptyIcon", "round", "className", "children", "style"])

  const edge = icon && rarity ? RARITY[rarity] : "rgb(255 255 255 / 0.08)"
  return (
    <button
      ref={ref}
      type="button"
      data-slot="item-slot"
      data-over={over || undefined}
      style={{ ...style, ["--edge" as string]: edge }}
      className={cn(
        "relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md bg-black/30 shadow-[inset_0_0_0_1px_var(--edge)] outline-none hover:bg-white/8 focus-visible:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.6)] data-[over]:shadow-[inset_0_0_0_2px_rgb(255_255_255/0.7)]",
        round && "ui-round size-10 rounded-full shadow-[0_0_0_1px_rgb(255_255_255/0.07),0_2px_8px_rgb(0_0_0/0.25)] data-[over]:shadow-[0_0_0_2px_rgb(255_255_255/0.7)]",
        className,
      )}
      {...props}
    >
      {icon ? (
        <img src={icon} alt="" draggable={false} className={cn("pointer-events-none", round ? "mt-1.5 max-h-6 max-w-6" : "max-h-9 max-w-9", dim && "opacity-30 grayscale")} />
      ) : emptyIcon ? (
        <img src={emptyIcon} alt="" draggable={false} className="pointer-events-none max-h-9 max-w-9" />
      ) : (
        placeholder && <span className="pointer-events-none font-head text-[11px] text-text-faint">{placeholder}</span>
      )}
      {count !== undefined && count > 1 && (
        <span className="pointer-events-none absolute right-1 bottom-0.5 font-tiny text-[10px] font-bold leading-none text-white [text-shadow:1px_0_0_#000,-1px_0_0_#000,0_1px_0_#000,0_-1px_0_#000]">
          {count}
        </span>
      )}
      {keyHint && (
        <span className={cn("pointer-events-none absolute font-tiny text-[9px] leading-none text-white ui-text-shadow", round ? "top-[3px] left-1/2 -translate-x-1/2" : "top-1 left-1")}>
          {keyHint}
        </span>
      )}
      {children}
    </button>
  )
})

export { Slot, RARITY }
