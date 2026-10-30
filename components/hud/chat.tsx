import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Input } from "#/components/game/input"
import { Kbd } from "#/components/game/kbd"
import { Window } from "#/components/game/window"
import { useWindow } from "#/components/hud/use-window"
import { NAME_COLOR } from "#/components/hud/name_color"
import { useStick } from "#/components/hud/use-stick"

export function Chat() {
  const game = useGame()
  const win = useWindow("chat")
  const chat = useGameState((s) => s.chat)
  const typing = useGameState((s) => s.typing)
  const textState = useState(""),
    text = textState[0],
    setText = textState[1]
  const input = useRef<HTMLInputElement>(null)
  const lines = chat.filter((l) => l.channel !== "system")
  const logSource = useStick(lines.length),
    log = logSource.log,
    onScroll = logSource.onScroll

  useEffect(() => {
    if (typing && !win.open) game.toggleWindow("chat")
    if (typing) input.current?.focus()
  }, [typing, win.open, game])

  const send = (event: FormEvent) => {
    event.preventDefault()
    if (text.trim()) game.say(text)
    setText("")
    game.setTyping(false)
    input.current?.blur()
  }

  if (!win.open) return null
  return (
    <Window
      id="chat"
      key={win.key}
      {...win.props}
      title="チャット"
      hotkey="Alt+C"
      size={{ initial: [340, 210], min: [260, 140] }}
      initial={(w, h) => ({ x: w - 340 - 64, y: h - 210 - 76 })}
      bodyClassName="flex flex-col p-0"
    >
      <div ref={log} onScroll={onScroll} className="ui-scroll min-h-0 flex-1 overflow-y-auto px-3 py-1 font-body text-[12px] leading-[19px] select-text">
        {lines.map((line) => (
          <p key={line.id} className="break-all">
            <span className={NAME_COLOR(line)}>{line.name}</span>
            {line.channel === "party" && <span className="text-text-dim">（パーティ）</span>}
            {line.shout && <span className="text-text-dim">（叫ぶ）</span>}
            <span className="text-text-dim">：</span>
            <span className={line.channel === "npc" ? "text-npc" : "text-white"}>{line.text}</span>
          </p>
        ))}
      </div>
      <form onSubmit={send} className="px-2.5 pt-1 pb-2.5">
        {typing ? (
          <Input ref={input} value={text} maxLength={140} placeholder="メッセージを入力…（/p 仲間・/s 叫ぶ）" onChange={(e) => setText(e.target.value)} onBlur={() => !text && game.setTyping(false)} />
        ) : (
          <button
            type="button"
            onClick={() => game.setTyping(true)}
            className="flex h-8 w-full cursor-text items-center gap-1.5 rounded-full bg-black/35 px-3.5 text-left font-body text-[13px] text-text-faint shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]"
          >
            メッセージを入力… <Kbd className="ml-auto">Enter</Kbd>
          </button>
        )}
      </form>
    </Window>
  )
}
