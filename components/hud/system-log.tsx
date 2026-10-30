import { useGameState } from "#/hooks/use-game-state"
import { Window } from "#/components/game/window"
import { useWindow } from "#/components/hud/use-window"
import { useStick } from "#/components/hud/use-stick"

/** The system log (left, middle): arriving, buying, being refused. */
export function SystemLog() {
  const win = useWindow("syslog")
  const chat = useGameState((s) => s.chat)
  const lines = chat.filter((l) => l.channel === "system")
  const logSource = useStick(lines.length),
    log = logSource.log,
    onScroll = logSource.onScroll
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
