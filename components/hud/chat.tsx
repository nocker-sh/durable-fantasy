// Chat (ui.md §3.4): bottom right, what people say with the line to type in (Enter opens it); and
// the system log on the left, what happens (arriving, buying, being refused). Both resizable.
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react"
import type React from "react"
import type { ChatLine } from "#/world/game.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"
import { Input } from "#/components/game/input.tsx"
import { Kbd } from "#/components/game/kbd.tsx"
import { Window } from "#/components/game/window.tsx"
import { useWindow } from "./use-window.ts"

const NAME_COLOR = (line: ChatLine) => (line.self ? "text-white" : line.channel === "npc" ? "text-npc" : "text-player")

/** Keep a log scrolled to the newest line unless the reader has scrolled up. */
function useStick(length: number) {
  const log = useRef<HTMLDivElement>(null)
  const stick = useRef(true)
  useLayoutEffect(() => {
    if (stick.current && log.current) log.current.scrollTop = log.current.scrollHeight
  }, [length])
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 8
  }
  return { log, onScroll }
}

/** The system log (left, middle): arriving, buying, being refused. */
export function SystemLog() {
  const win = useWindow("syslog")
  const chat = useGameState((s) => s.chat)
  const lines = chat.filter((l) => l.channel === "system")
  const { log, onScroll } = useStick(lines.length)
  if (!win.open) return null
  return (
    <Window
      id="syslog"
      key={win.key}
      {...win.props}
      title="システムログ"
      size={{ initial: [340, 170], min: [240, 100] }}
      initial={(_, h) => ({ x: 16, y: Math.round(h / 2 - 40) })}
      bodyClassName="flex flex-col p-0"
    >
      <div ref={log} onScroll={onScroll} className="ui-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-2.5 font-body text-[12px] leading-[19px] text-white select-text">
        {lines.map((line) => (
          <p key={line.id}>{line.text}</p>
        ))}
      </div>
    </Window>
  )
}

export function Chat() {
  const game = useGame()
  const win = useWindow("chat")
  const chat = useGameState((s) => s.chat)
  const typing = useGameState((s) => s.typing)
  const [text, setText] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const lines = chat.filter((l) => l.channel !== "system")
  const { log, onScroll } = useStick(lines.length)

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
