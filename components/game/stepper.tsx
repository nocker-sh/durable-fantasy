// A small − n + quantity picker.
import { cn } from "cn"
import { Button } from "./button.tsx"

function Stepper({ value, min = 1, max, onChange, className }: { value: number; min?: number; max: number; onChange: (value: number) => void; className?: string }) {
  const set = (v: number) => onChange(Math.max(min, Math.min(max, v)))
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Button size="icon-sm" aria-label="減らす" disabled={value <= min} onClick={() => set(value - 1)}>
        −
      </Button>
      <span className="w-6 text-center font-head text-[13px] tabular-nums">{value}</span>
      <Button size="icon-sm" aria-label="増やす" disabled={value >= max} onClick={() => set(value + 1)}>
        +
      </Button>
    </div>
  )
}

export { Stepper }
