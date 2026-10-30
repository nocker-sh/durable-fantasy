// The minimap window (ui.md §3.2, Tab): the map from above, north up. Only what is on a map: its
// name, you (with your facing), other players, residents, shops and warps. Click to walk there; the
// title bar switches between a small and a large map.
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react"
import { shopMarkers } from "#/world/maps/shop-markers"
import { formatTime } from "#/world/core/format-time"
import { phase } from "#/world/core/phase"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { TitleButton } from "#/components/game/title-button"
import { Window } from "#/components/game/window"
import { useWindow } from "./use-window"

const SIZES = [168, 256] as const

export function Minimap() {
  const game = useGame()
  const win = useWindow("minimap")
  const largeState = useState(() => localStorage.getItem("ui-minimap/large") === "1"),
    large = largeState[0],
    setLarge = largeState[1]
  const SIZE = SIZES[large ? 1 : 0]
  const canvas = useRef<HTMLCanvasElement>(null)
  const me = useGameState((s) => s.me)
  const players = useGameState((s) => s.players)
  const npcs = useGameState((s) => s.npcs)
  const map = useGameState((s) => s.map)
  const loading = useGameState((s) => s.loading)
  const min = useGameState((s) => s.clock.min)
  const shops = useMemo(() => shopMarkers(map.id, min), [map.id, min])
  const background = useRef<HTMLCanvasElement | null>(null)

  // Rescale the ground only when the map or its display size changes.
  useEffect(() => {
    background.current = null
    const ground = game.groundImage()
    if (!ground || loading) return
    const image = document.createElement("canvas")
    image.width = image.height = SIZE
    const ctx = image.getContext("2d")!
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(ground, 0, 0, SIZE, SIZE)
    ctx.fillStyle = "rgba(18,20,34,0.28)"
    ctx.fillRect(0, 0, SIZE, SIZE)
    background.current = image
  }, [game, map, loading, SIZE])

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d")
    const ground = background.current
    if (!ctx || !ground) return
    const scale = SIZE / game.mapSize
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(ground, 0, 0, SIZE, SIZE)
    const at = (x: number, z: number) => [Math.round(x * scale), Math.round(z * scale)] as const
    const square = (inputProps2: { x: number; z: number; r: number; fill: string }) => {
      const x = inputProps2.x
      const z = inputProps2.z
      const r = inputProps2.r
      const fill = inputProps2.fill

      const pxState = at(x, z),
        px = pxState[0],
        pz = pxState[1]
      ctx.fillStyle = "#0b0c15"
      ctx.fillRect(px - r - 1, pz - r - 1, r * 2 + 2, r * 2 + 2)
      ctx.fillStyle = fill
      ctx.fillRect(px - r, pz - r, r * 2, r * 2)
    }
    for (const n of npcs) square({ x: n.x, z: n.z, r: 1, fill: "#e8dcc0" })
    for (const entry of map.warps) {
      const i = entry[0]
      const j = entry[1]

      const pxState2 = at((i + 0.5) / 2, (j + 0.5) / 2),
        px = pxState2[0],
        pz = pxState2[1]
      ctx.strokeStyle = "#b8d0ff"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(px, pz, 4, 0, Math.PI * 2)
      ctx.stroke()
    }
    for (const p of players) square({ x: p.x, z: p.z, r: 2, fill: "#8fd0e0" })
    // you: an arrow along your facing (heading 0 faces +z, which is down on the map)
    const pxState3 = at(me.x, me.z),
      px = pxState3[0],
      pz = pxState3[1]
    const dx = Math.sin(me.heading),
      dz = Math.cos(me.heading)
    ctx.save()
    ctx.translate(px, pz)
    ctx.beginPath()
    ctx.moveTo(dx * 6, dz * 6)
    ctx.lineTo(-dz * 4 - dx * 3, dx * 4 - dz * 3)
    ctx.lineTo(dz * 4 - dx * 3, -dx * 4 - dz * 3)
    ctx.closePath()
    ctx.fillStyle = "#f0d078"
    ctx.strokeStyle = "#0b0c15"
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fill()
    ctx.restore()
  }, [game, me, players, npcs, map, loading, SIZE, win.open])

  const walk = (event: MouseEvent<HTMLCanvasElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    game.walkTo(((event.clientX - box.left) / box.width) * game.mapSize, ((event.clientY - box.top) / box.height) * game.mapSize)
  }

  if (!win.open) return null
  return (
    <Window
      id="minimap"
      key={win.key}
      {...win.props}
      title={map.name}
      hotkey="Tab"
      initial={(w) => ({ x: w - SIZE - 120, y: 12 })}
      bodyClassName="px-2.5 pt-1 pb-2"
      actions={
        <TitleButton
          label={large ? "小さくする" : "大きくする"}
          onClick={() => {
            localStorage.setItem("ui-minimap/large", large ? "0" : "1")
            setLarge(!large)
          }}
        >
          {large ? "小" : "大"}
        </TitleButton>
      }
    >
      <div className="relative">
        <canvas
          ref={canvas}
          width={SIZE}
          height={SIZE}
          onClick={walk}
          aria-label="ミニマップ"
          style={{ width: SIZE, height: SIZE }}
          className="block cursor-pointer rounded-md shadow-[0_0_0_1px_rgb(255_255_255/0.08)] [image-rendering:pixelated]"
        />
        {!loading &&
          shops.map((inputProps) => {
            const cell = inputProps.cell
            const sellers = inputProps.shops

            const open = sellers.some((s) => s.open)
            const label = sellers.map((s) => `${s.name}：${s.open ? "営業中" : "準備中"}`).join("\n")
            const x = (cell[0] + 0.5) / 2,
              z = (cell[1] + 0.5) / 2
            return (
              <button
                key={cell.join(",")}
                type="button"
                title={label}
                aria-label={label}
                onClick={() => game.walkTo(x, z, { snapToWarp: false })}
                className="absolute flex size-3.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-white"
                style={{ left: (x / game.mapSize) * SIZE, top: (z / game.mapSize) * SIZE }}
              >
                <span className="size-1.5 border border-amber-300 shadow-[0_0_0_1px_#0b0c15]" style={{ backgroundColor: open ? "#e0b84a" : "#202332" }} />
              </button>
            )
          })}
        <span className="pointer-events-none absolute top-1 left-1/2 -translate-x-1/2 rounded bg-black/50 px-1 font-head text-[10px] leading-3.5 text-white">北</span>
      </div>
      {shops.length > 0 && (
        <div className="mt-1 flex gap-3 text-[10px] text-amber-200">
          <span>■ 営業中</span>
          <span>□ 準備中</span>
        </div>
      )}
      <Clock />
    </Window>
  )
}

/** The time of day under the map: the hour and what part of the day it is. */
function Clock() {
  const min = useGameState((s) => s.clock.min)
  const room = useGameState((s) => s.room)
  return (
    <div className="mt-1.5 flex items-center justify-between font-head text-[11px] leading-4 text-white">
      <span>{room ? `町${room.world} ch.${room.channel}` : ""}</span>
      <span>
        {formatTime(min)} {phase(min)}
      </span>
    </div>
  )
}
