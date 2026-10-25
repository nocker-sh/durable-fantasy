// Top middle (ui.md §3.15): one-line results and refusals that fade after 2.5 seconds.
import { cn } from "cn"
import { useGameState } from "#/components/game/context.tsx"

export function Notices() {
  const notices = useGameState((s) => s.notices)
  return (
    <div className="pointer-events-none absolute top-20 left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-1">
      {notices.map((n) => (
        <div
          key={n.id}
          className={cn(
            "animate-ui-notice bg-panel-soft px-4 py-0.5 font-head text-[13px] ui-text-shadow shadow-[inset_0_1px_0_rgb(184_149_90/0.4),inset_0_-1px_0_rgb(184_149_90/0.4)]",
            n.tone === "good" && "text-good",
            n.tone === "bad" && "text-bad",
            n.tone === "info" && "text-text",
          )}
        >
          {n.text}
        </div>
      ))}
    </div>
  )
}
