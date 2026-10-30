// Dev only (ui.md §8): time of day, the edge blur, position, FPS, sprites, connection and a
// reset for the player's data. F1 or ` opens it. Built from the dev shadcn kit, not the game UI.
import "#resources/dev/debug"
import { useEffect, useState } from "react"
import { Button } from "#/components/ui/button"
import { Card } from "#/components/ui/card"
import { CardContent } from "#/components/ui/card-content"
import { CardHeader } from "#/components/ui/card-header"
import { CardTitle } from "#/components/ui/card-title"
import { Label } from "#/components/ui/label"
import { Slider } from "#/components/ui/slider"
import { Switch } from "#/components/ui/switch"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { TIMES_OF_DAY, diorama } from "#/world/scene/runtime/settings"

// Expose the same development-only settings to the console and screenshot tools.
Object.assign(window, { diorama })

export default function DebugPanel() {
  const game = useGame()
  const open = useGameState((s) => s.debug)
  const infoState = useState(() => game.debugInfo()),
    info = infoState[0],
    setInfo = infoState[1]
  const redrawState = useState(0),
    redraw = redrawState[1]

  useEffect(() => {
    if (!open) return
    const timer = setInterval(() => setInfo(game.debugInfo()), 500)
    return () => clearInterval(timer)
  }, [game, open])

  if (!open) return null
  const tune = (inputProps: { key: "start" | "falloff" | "strength" | "saturation" | "contrast"; min: number; max: number; step: number }) => {
    const key = inputProps.key
    const min = inputProps.min
    const max = inputProps.max
    const step = inputProps.step
    return (
      <div className="grid gap-1.5">
        <Label>
          {key} <span className="text-muted-foreground tabular-nums">{diorama[key].toFixed(2)}</span>
        </Label>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[diorama[key]]}
          onValueChange={(v) => {
            diorama[key] = Array.isArray(v) ? v[0] : v
            redraw((n) => n + 1)
          }}
        />
      </div>
    )
  }

  return (
    <div className="dev-debug fixed top-3 left-1/2 z-[100] w-80 -translate-x-1/2">
      <Card size="sm">
        <CardHeader>
          <CardTitle>デバッグ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 tabular-nums">
            <dt className="text-muted-foreground">FPS</dt>
            <dd>{info.fps.toFixed(0)}</dd>
            <dt className="text-muted-foreground">マップ</dt>
            <dd>{info.map}</dd>
            <dt className="text-muted-foreground">マス</dt>
            <dd>{info.cell ? info.cell.join(", ") : "-"}</dd>
            <dt className="text-muted-foreground">座標</dt>
            <dd>{info.position ? `${info.position.x.toFixed(2)}, ${info.position.z.toFixed(2)}` : "-"}</dd>
            <dt className="text-muted-foreground">スプライト待ち</dt>
            <dd>{info.sprites}</dd>
            <dt className="text-muted-foreground">接続</dt>
            <dd>
              {info.online}（{info.players}人）
            </dd>
            <dt className="text-muted-foreground">ID</dt>
            <dd className="truncate text-xs">{info.playerId}</dd>
          </dl>
          <div className="flex gap-1">
            {TIMES_OF_DAY.map((label, i) => (
              <Button key={label} size="sm" variant="outline" onClick={() => game.setTimeOfDay(i)}>
                {label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={diorama.enabled}
              onCheckedChange={(on) => {
                diorama.enabled = on
                redraw((n) => n + 1)
              }}
            />
            <Label>縁のぼかし</Label>
          </div>
          {tune({ key: "start", min: 0, max: 1.4, step: 0.01 })}
          {tune({ key: "falloff", min: 0.02, max: 1, step: 0.01 })}
          {tune({ key: "strength", min: 0, max: 40, step: 0.5 })}
          {tune({ key: "saturation", min: 0.8, max: 1.4, step: 0.01 })}
          {tune({ key: "contrast", min: 0.8, max: 1.4, step: 0.01 })}
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              await fetch("/api/player/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: info.playerId }) })
              game.rejoin()
            }}
          >
            プレイヤーデータを初期化
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
