// The world map (ui.md §3.3): the maps as places joined by roads, where you are, and the cities
// still beyond reach.
import { useGameState } from "#/hooks/use-game-state"
import { Window } from "#/components/game/window"
import { MAPS } from "#/world/maps"
import { isOpen } from "#/world/maps/is-open"
import { GRID_SIZE, WORLD } from "#/world/maps/grid"
import { LOCKED_CITIES, WORLD_NODES } from "#/world/maps/world-map"
import { worldNodeOf } from "#/world/maps/world-node-of"
import { worldRoads } from "#/world/maps/world-roads"
import { useWindow } from "#/components/hud/use-window"

const W = 360,
  H = 300
const CW = W / GRID_SIZE.cols,
  CH = H / GRID_SIZE.rows
const px = (x: number) => (x / 100) * W
const py = (y: number) => (y / 100) * H
/** A district's own name, without its city's. */
const shortName = (id: string) => MAPS[id].name.split(" ― ").pop()!

export function WorldmapWindow() {
  const win = useWindow("worldmap")
  const map = useGameState((s) => s.map)
  if (!win.open) return null
  const here = worldNodeOf(map.id)
  const roads = worldRoads()
  // the town's squares, to ring them and name the town beside them
  const town = WORLD_NODES.filter((n) => n.city)
  const tx0 = Math.min(...town.map((n) => n.x)),
    ty1 = Math.max(...town.map((n) => n.y))
  return (
    <Window id="worldmap" title="地図" hotkey="M" {...win.props} key={win.key} initial={(w, h) => ({ x: Math.round(w / 2 - W / 2 - 12), y: Math.round(h / 2 - H / 2 - 40) })}>
      <div className="ui-well relative overflow-hidden bg-[radial-gradient(circle_at_45%_60%,#2a3a3a,#141a22_75%)]" style={{ width: W, height: H }}>
        <svg width={W} height={H} className="absolute inset-0">
          {/* the squares of the world grid */}
          {WORLD.map((q) => (
            <rect
              key={q.at.join()}
              x={q.at[0] * CW + 2}
              y={q.at[1] * CH + 2}
              width={CW - 4}
              height={CH - 4}
              rx={4}
              fill={q.map && worldNodeOf(q.map)?.city ? "#3a4630" : "#ffffff"}
              opacity={q.map ? (worldNodeOf(q.map)?.city ? 0.55 : isOpen(q.map) ? 0.07 : 0.03) : 0}
              stroke={q.city ? "#6a6458" : "none"}
              strokeDasharray="3 3"
            />
          ))}
          {roads.map((entry) => {
            const a = entry[0]
            const b = entry[1]
            return (
              // a road into a closed field is drawn faint (game-system.md §1)
              <line
                key={a.id + b.id}
                x1={px(a.x)}
                y1={py(a.y)}
                x2={px(b.x)}
                y2={py(b.y)}
                stroke={isOpen(a.id) && isOpen(b.id) ? "#b8a070" : "#6a6458"}
                strokeWidth={2}
                strokeDasharray={a.city && b.city ? undefined : isOpen(a.id) && isOpen(b.id) ? "4 3" : "2 4"}
                opacity={isOpen(a.id) && isOpen(b.id) ? 0.75 : 0.5}
              />
            )
          })}
          {LOCKED_CITIES.map((c) => {
            const from = WORLD_NODES.find((n) => n.id === c.from)!
            return <line key={c.name} x1={px(from.x)} y1={py(from.y)} x2={px(c.x)} y2={py(c.y)} stroke="#6a6458" strokeWidth={2} strokeDasharray="2 4" />
          })}
        </svg>
        {WORLD_NODES.map((n) => {
          const isHere = here?.id === n.id
          return (
            <div
              key={n.id}
              className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center ${isOpen(n.id) ? "" : "opacity-40"}`}
              style={{ left: px(n.x), top: py(n.y), width: CW - 6 }}
              title={isOpen(n.id) ? MAPS[n.id]?.name : `${MAPS[n.id]?.name}（まだ通れない）`}
            >
              <div
                className={
                  isHere
                    ? "size-3 rounded-sm bg-me shadow-[0_0_0_2px_rgb(240_208_120/0.5)]"
                    : n.city
                      ? "size-2.5 rounded-sm bg-[#8a9a6a] shadow-[inset_0_0_0_1px_var(--color-brass)]"
                      : "size-2 rounded-full bg-[#c8b890]"
                }
              />
              <span className={`mt-0.5 text-center font-head text-[10px] leading-tight ui-text-shadow ${isHere ? "text-me" : "text-text-dim"}`}>{n.city ? shortName(n.id) : MAPS[n.id].name}</span>
            </div>
          )
        })}
        {/* the town's name, just below its squares */}
        <span className="absolute whitespace-nowrap font-head text-xs text-brass-hi ui-text-shadow" style={{ left: px(tx0) - CW / 2 + 6, top: py(ty1) - CH / 2 + 6 }}>
          ファンティエット
        </span>
        {LOCKED_CITIES.map((c) => (
          <div key={c.name} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: px(c.x), top: py(c.y) }}>
            <div className="mx-auto size-3 rounded-sm border border-dashed border-text-dim" />
            <div className="font-head text-[11px] text-text-dim ui-text-shadow">{c.name}</div>
            <div className="font-body text-[10px] text-text-dim/80">まだ行けない</div>
          </div>
        ))}
        <span className="absolute top-1.5 right-2 font-head text-[11px] text-text-dim">北↑</span>
      </div>
      <p className="mt-2 font-body text-xs text-text-dim">
        現在地: <span className="text-me">{map.name}</span>
      </p>
    </Window>
  )
}
