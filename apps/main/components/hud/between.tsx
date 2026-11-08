import "#resources/packages/fontsource/shippori-mincho/400"
import type { ReactNode } from "react"
import { FADE_MS } from "#/components/hud/loading-rules"
import { Ash } from "#/components/hud/ash"

/** Loading and connection interruption only; keep this font and presentation out of normal game windows. */
export function Between(inputProps: { title: string; progress?: number; passage?: string; fading?: boolean; children?: ReactNode }) {
  const title = inputProps.title
  const progress = inputProps.progress
  const passage = inputProps.passage
  const fading = inputProps.fading
  const children = inputProps.children

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[90] flex flex-col items-center bg-[#0c0c0d] transition-opacity ease-out"
      style={{ fontFamily: "'Shippori Mincho', 'Noto Serif JP', serif", opacity: fading ? 0 : 1, transitionDuration: `${FADE_MS}ms`, pointerEvents: fading ? "none" : "auto" }}
    >
      <Ash />
      <div className="mt-[56vh] flex w-[min(80vw,420px)] flex-col items-center gap-5">
        <div className="text-[17px] tracking-[0.35em] text-[#d8d4cc]">{title}</div>
        {progress !== undefined && (
          <div className="h-px w-[220px] bg-[#26262a]">
            <div className="h-px bg-[#bdb8ae] transition-[width] duration-500" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}
        {passage && <p className="text-center text-[13px] leading-[2.1] tracking-[0.08em] whitespace-pre-line text-[#77736c]">{passage}</p>}
        {children}
      </div>
    </div>
  )
}
