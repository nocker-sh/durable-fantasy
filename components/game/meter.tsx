// Copied from the dev shadcn Progress and restyled as a gem bar (ui.md §6.1): a rounded glass
// tube filled with red or blue, the numbers beside it.
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const fill = cva("h-full rounded-full transition-[width] duration-300 ease-out", {
  variants: {
    tone: {
      hp: "bg-[#e0504a]",
      sp: "bg-[#4a86e0]",
      stamina: "bg-[#8ab850]",
      exp: "bg-[var(--color-exp)]",
    },
  },
  defaultVariants: { tone: "hp" },
})

function Meter({
  className,
  label,
  value,
  max,
  tone,
  showValue = true,
  icon,
  ...props
}: Omit<ProgressPrimitive.Root.Props, "value"> & VariantProps<typeof fill> & { label?: string; value: number; max: number; showValue?: boolean; icon?: string }) {
  return (
    <ProgressPrimitive.Root value={Math.min(value, max)} max={Math.max(1, max)} data-slot="meter" className={cn("flex items-center gap-1.5", className)} {...props}>
      {icon && <img src={icon} alt="" aria-hidden className="size-[18px] shrink-0" />}
      {label && <ProgressPrimitive.Label className="w-5 shrink-0 font-tiny text-[8px] leading-none text-brass-hi">{label}</ProgressPrimitive.Label>}
      <ProgressPrimitive.Track className="relative h-full max-h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-black/45 shadow-[0_0_0_1px_rgb(255_255_255/0.06)]">
        <ProgressPrimitive.Indicator className={fill({ tone })} />
      </ProgressPrimitive.Track>
      {showValue && (
        <span className="w-[62px] shrink-0 font-head text-[11px] leading-none text-white tabular-nums ui-text-shadow">
          {value} / {max}
        </span>
      )}
    </ProgressPrimitive.Root>
  )
}

export { Meter }
