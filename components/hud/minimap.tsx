// The minimap window (ui.md §3.2, Tab): the map from above, north up. Only what is on a map: its
// name, you (with your facing), other players, NPCs by kind and warps. Click to walk there; the
// title bar switches between a small and a large map.
import { useEffect, useRef, useState, type MouseEvent } from "react"
import { formatTime, phase } from "#/world/core/clock.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"
import { TitleButton, Window } from "#/components/game/window.tsx"
import { useWindow } from "./use-window.ts"

const SIZES = [168, 256] as const

export function Minimap() {
  const game = useGame()
  const win = useWindow("minimap")
  const [large, setLarge] = useState(() => localStorage.getItem("ui-minimap/large") === "1")
  const SIZE = SIZES[large ? 1 : 0]
  const canvas = useRef<HTMLCanvasElement>(null)
  const me = useGameState((s) => s.me)
  const players = useGameState((s) => s.players)
  const npcs = useGameState((s) => s.npcs)
  const map = useGameState((s) => s.map)
  const loading = useGameState((s) => s.loading)

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d")
    const ground = game.groundImage()
    if (!ctx || !ground) return
    const scale = SIZE / game.mapSize
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(ground, 0, 0, SIZE, SIZE)
    // a light wash so the marks read over the ground
    ctx.fillStyle = "rgba(18,20,34,0.28)"
    ctx.fillRect(0, 0, SIZE, SIZE)
    const at = (x: number, z: number) => [Math.round(x * scale), Math.round(z * scale)] as const
    const square = (x: number, z: number, r: number, fill: string) => {
      const [px, pz] = at(x, z)
      ctx.fillStyle = "#0b0c15"
      ctx.fillRect(px - r - 1, pz - r - 1, r * 2 + 2, r * 2 + 2)
      ctx.fillStyle = fill
      ctx.fillRect(px - r, pz - r, r * 2, r * 2)
    }
    for (const n of npcs) {
      if (n.role === "shop") square(n.x, n.z, 2, "#e0b84a")
      else square(n.x, n.z, 1, "#e8dcc0")
    }
    for (const [i, j] of map.warps) {
      const [px, pz] = at((i + 0.5) / 2, (j + 0.5) / 2)
      ctx.strokeStyle = "#b8d0ff"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(px, pz, 4, 0, Math.PI * 2)
      ctx.stroke()
    }
    for (const p of players) square(p.x, p.z, 2, "#8fd0e0")
    // you: an arrow along your facing (heading 0 faces +z, which is down on the map)
    const [px, pz] = at(me.x, me.z)
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
        <span className="pointer-events-none absolute top-1 left-1/2 -translate-x-1/2 rounded bg-black/50 px-1 font-head text-[10px] leading-3.5 text-white">北</span>
      </div>
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
