// Bottom middle (ui.md §3.5): the conversation. The speaker's tag sits on the top edge; the text
// types out; click or Space shows it all, then turns the page; the last page offers choices.
import { useEffect, useState } from "react"
import { revealed } from "#/world/revealed"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Kbd } from "#/components/game/kbd"
import { Panel } from "#/components/game/panel"

export function DialogueBox() {
  const game = useGame()
  const dialogue = useGameState((s) => s.dialogue)
  const nowState = useState(() => performance.now()),
    now = nowState[0],
    setNow = nowState[1]

  // re-render each frame while the page is typing out
  useEffect(() => {
    if (!dialogue) return
    let frame = 0
    const loop = () => {
      const t = performance.now()
      setNow(t)
      if (revealed(dialogue, t) < dialogue.pages[dialogue.page].length) frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [dialogue])

  if (!dialogue) return null
  const text = dialogue.pages[dialogue.page]
  const shown = revealed(dialogue, now)
  const done = shown >= text.length
  const last = dialogue.page >= dialogue.pages.length - 1

  return (
    <Panel role="dialog" aria-label={`${dialogue.name}との会話`} className="absolute bottom-[86px] left-1/2 z-30 w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 animate-ui-in p-[3px]">
      <div className="ui-titlebar absolute -top-[13px] left-5 flex items-baseline gap-2 px-3 py-[3px] shadow-[inset_0_0_0_1px_var(--color-brass),0_0_0_1px_#000]">
        <span className="font-head text-[13px] text-brass-hi ui-text-shadow">{dialogue.name}</span>
        <span className="font-head text-[11px] text-text-dim">{dialogue.job}</span>
      </div>
      <button
        type="button"
        onClick={() => game.advanceDialogue()}
        className="relative block min-h-[88px] w-full cursor-pointer px-6 pt-6 pb-4 text-left font-body text-[15px] leading-7 text-text ui-text-shadow"
      >
        {text.slice(0, shown)}
        <span className="invisible">{text.slice(shown)}</span>
        {done && !last && <span className="absolute right-5 bottom-3 animate-ui-blink font-head text-xs text-brass-hi">▼</span>}
      </button>
      {done && last && (
        <div className="flex flex-col gap-0.5 border-t border-brass-lo/60 px-5 py-2">
          {dialogue.choices.map((choice, index) => (
            <button
              key={choice.label}
              type="button"
              onClick={() => game.choose(index)}
              className="group flex cursor-pointer items-center gap-2.5 px-2 py-1 text-left font-body text-sm text-text hover:bg-white/5"
            >
              <Kbd>{String(index + 1)}</Kbd>
              <span className="text-brass-hi opacity-0 group-hover:opacity-100">▶</span>
              {choice.label}
            </button>
          ))}
        </div>
      )}
    </Panel>
  )
}
