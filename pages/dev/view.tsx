import "#resources/dev/dev"
import { useEffect, useRef, useState } from "react"
import { MapScene } from "#/world/scene/runtime/scene"
import { diorama } from "#/world/scene/runtime/settings"
import { spritesPending } from "#/world/scene/sprites-pending"
import { MAP_SCENES } from "#/world/scene/runtime/definitions"
import { MAPS } from "#/world/maps/index"
import { formatTime } from "#/world/core/format-time"
import { jstMinutes } from "#/world/core/jst-minutes"
import { parseTime } from "#/world/core/parse-time"
import { MAP_KIND } from "#/dev/sheets/shared"
import { useNoCanvasMenu } from "#/hooks/use-no-canvas-menu"

/**
 * One map as the game draws it, with nobody playing: no player, no windows, no names, no server.
 * Everything is a query, to put together freely:
 * /dev/view?map=phanthiet-market&time=21:00&x=24&z=24&zoom=0&turn=2&ui=0
 * map: the map (the square if left out); time: the hour it is held at; x and z: where to look (world
 * units); zoom: 0 is furthest out; turn: the view turned by that many 45° steps; blur=0 drops the
 * soft blur at the screen's edge; ui=0 hides the small panel too (H toggles it).
 * body[data-ready] is "1" once the map is drawn and lit by the clock (for screenshots), "missing"
 * for a map that does not exist.
 */
export const layout = false

const KIND_ORDER = ["town", "indoor", "field", "dungeon"]
const choices = Object.keys(MAP_SCENES)
  .map((id) => ({ id, name: MAPS[id]?.name ?? id, kind: MAPS[id]?.kind ?? "field" }))
  .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind))

export default function MapView() {
  useNoCanvasMenu()
  // drawn in the browser only: the query and the clock are not known on the server
  const mountedState = useState(false),
    mounted = mountedState[0],
    setMounted = mountedState[1]
  useEffect(() => setMounted(true), [])
  return mounted ? <MapViewer /> : null
}

function MapViewer() {
  const ref = useRef<HTMLDivElement>(null)
  const scene = useRef<MapScene | null>(null)
  const queryState = useState(() => new URLSearchParams(location.search)),
    query = queryState[0]
  const timeState = useState(() => parseTime(query.get("time")) ?? jstMinutes(Date.now())),
    time = timeState[0],
    setTime = timeState[1]
  const panelState = useState(query.get("ui") !== "0"),
    panel = panelState[0],
    setPanel = panelState[1]
  const loadingState = useState<string | null>("読み込んでいます…"),
    loading = loadingState[0],
    setLoading = loadingState[1]
  const map = query.get("map") ?? "phanthiet"
  const known = map in MAP_SCENES

  useEffect(() => {
    if (!known) document.body.dataset.ready = "missing"
    if (!known || !ref.current) return
    document.body.dataset.ready = "0"
    diorama.enabled = query.get("blur") !== "0"
    const x = Number(query.get("x")),
      z = Number(query.get("z"))
    const s = new MapScene({
      element: ref.current,
      events: {
        progress: setLoading,
        ready: () => setLoading(null),
        failed: (error) => {
          console.error(error)
          setLoading("描けなかった。コンソールを見てください。")
        },
        walk: () => {},
        reach: () => {},
        gatherAt: () => {},
        stationAt: () => {},
        swing: () => {},
        tick: () => {},
      },
      map: map,
      options: { preview: true, at: query.has("x") && query.has("z") ? [x, z] : undefined, zoom: query.has("zoom") ? Number(query.get("zoom")) : undefined, turn: Number(query.get("turn")) || 0 },
    })
    scene.current = s
    return () => {
      s.destroy()
      scene.current = null
    }
  }, [map, known, query])

  useEffect(() => {
    if (loading) return
    scene.current?.setClock(time)
    // ready once the figures are drawn, and the residents and lights have had a moment to settle by the clock
    // (residents who keep walking keep asking for new sides of themselves, so it gives up waiting after 10 s)
    let wait = 0
    const until = performance.now() + 10_000
    const settle = () => {
      wait = window.setTimeout(() => (spritesPending() && performance.now() < until ? settle() : (document.body.dataset.ready = "1")), 500)
    }
    settle()
    const q = new URLSearchParams(location.search)
    q.set("time", formatTime(time))
    history.replaceState(null, "", `${location.pathname}?${q}`)
    return () => window.clearTimeout(wait)
  }, [time, loading])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h" && !(e.target instanceof HTMLInputElement)) setPanel((p) => !p)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const go = (id: string) => {
    const q = new URLSearchParams({ map: id, time: formatTime(time) })
    if (!panel) q.set("ui", "0")
    location.href = `/dev/view?${q}`
  }

  return (
    <div className="fixed inset-0 bg-[#141812] text-white">
      <div ref={ref} className="absolute inset-0" />
      {(loading || !known) && <div className="absolute inset-0 grid place-items-center text-sm text-white/70">{known ? loading : `${map} というマップはない`}</div>}
      {panel && (
        <div className="absolute top-2 left-2 grid w-64 gap-2 rounded-md bg-black/55 p-2 text-xs backdrop-blur-sm">
          <select aria-label="マップ" className="rounded bg-black/60 p-1" value={map} onChange={(e) => go(e.target.value)}>
            {KIND_ORDER.map((kind) => (
              <optgroup key={kind} label={MAP_KIND[kind]}>
                {choices
                  .filter((c) => c.kind === kind)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          <label className="flex items-center gap-2">
            <span className="w-10 tabular-nums">{formatTime(time)}</span>
            <input aria-label="時刻" type="range" min={0} max={1425} step={15} value={time} onChange={(e) => setTime(Number(e.target.value))} className="flex-1" />
          </label>
          <p className="text-white/60">ドラッグ・WASD で移動、右ドラッグ・Q/E で回転、ホイールで寄る。H でこの枠を消す。</p>
        </div>
      )}
    </div>
  )
}
