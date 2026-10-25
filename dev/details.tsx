// What some sheets' rows show beyond their tables: a resident drawn from every side and in motion,
// a map's walkable cells from above.
import { useEffect, useRef, type ComponentType } from "react"
import { shopOfKeeper } from "#/world/core/shops.ts"
import { MAPS } from "#/world/maps/index.ts"
import { FH, FW, buildSheetStrip, type Anim } from "#/world/scene/figure.ts"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents.ts"
import { Grid } from "./db-view.tsx"
import { floorPlan } from "#/world/town/floorplan.ts"

/** One direction of one motion, playing at 8 frames a second. */
function Strip({ index, anim, view }: { index: number; anim: Anim; view: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const strip = buildSheetStrip(RESIDENT_LOOKS[index], anim, RESIDENTS[index].item, view)
    const n = strip.w / FW,
      c = ref.current!,
      ctx = c.getContext("2d")!
    const frames = Array.from({ length: n }, (_, f) => {
      const img = new ImageData(FW, FH)
      for (let y = 0; y < FH; y++) img.data.set(strip.data.subarray((y * strip.w + f * FW) * 4, (y * strip.w + f * FW + FW) * 4), y * FW * 4)
      return img
    })
    let f = 0
    ctx.putImageData(frames[0], 0, 0)
    const t = setInterval(() => ctx.putImageData(frames[(f = (f + 1) % n)], 0, 0), 125)
    return () => clearInterval(t)
  }, [index, anim, view])
  return <canvas ref={ref} width={FW} height={FH} className="w-full" style={{ imageRendering: "pixelated" }} />
}

const VIEWS = ["正面", "左下", "左", "左上", "背面", "右上", "右", "右下"]
const MOTIONS: [Anim, string][] = [
  ["idle", "待機"],
  ["walk", "歩く"],
  ["look", "話す"],
  ["sit", "座る"],
]

function Resident({ id }: { id: string }) {
  const index = RESIDENTS.findIndex((r) => r.name === id)
  if (index < 0) return null
  return (
    <section className="flex min-w-0 flex-col gap-1 lg:col-span-3">
      <h2 className="text-xs font-medium text-muted-foreground">見た目</h2>
      <Grid head={["", ...VIEWS]} widths={["w-12"]} rows={MOTIONS.map(([a, label]) => [label, ...VIEWS.map((_, v) => <Strip key={v} index={index} anim={a} view={v} />)])} />
    </section>
  )
}

/** Free and blocked cells, exits (blue), residents (yellow, red for shopkeepers) and where players appear (green). */
function Plan({ id }: { id: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const m = MAPS[id]
  useEffect(() => {
    const ctx = ref.current?.getContext("2d")
    if (!ctx || !m) return
    m.rows.forEach((row, j) =>
      [...row].forEach((c, i) => {
        ctx.fillStyle = c === "#" ? "#5b5463" : "#d9cbae"
        ctx.fillRect(i, j, 1, 1)
      }),
    )
    const dot = (c: readonly number[], color: string, r: number) => {
      ctx.fillStyle = color
      ctx.fillRect(c[0] - r + 0.5, c[1] - r + 0.5, r * 2, r * 2)
    }
    for (const w of m.warps) dot(w.at, "#3b82f6", 2)
    dot(m.spawn, "#16a34a", 1.5)
    for (const n of m.npcs) dot(n.cell, shopOfKeeper(n.name) ? "#dc2626" : "#eab308", 1)
  }, [m])
  if (!m) return null
  return (
    <section className="flex min-w-0 flex-col gap-1">
      <h2 className="text-xs font-medium text-muted-foreground">歩ける所</h2>
      <canvas ref={ref} width={m.size} height={m.size} className="w-full rounded-md border" style={{ imageRendering: "pixelated" }} />
    </section>
  )
}

const DIV_COLOR: Record<string, string> = { 壁: "#3a3448", 腰壁: "#7a6a58", カーテン: "#b04a4a", 棚: "#8a5a2a" }

/** A building's floor plan, a floor at a time, to scale (floorplan.ts). */
function House({ id }: { id: string }) {
  const p = floorPlan(id)
  const S = 60
  return (
    <section className="flex min-w-0 flex-col gap-1 lg:col-span-3">
      <h2 className="text-xs font-medium text-muted-foreground">間取り（1 マス 1 m）{p.unplaced.length > 0 && ` ／ 入らなかった物: ${p.unplaced.join("、")}`}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: p.floors }, (_, floor) => (
          <figure key={floor} className="flex min-w-0 flex-col gap-1">
            <figcaption className="text-xs">{floor + 1}階</figcaption>
            <svg viewBox={`-10 -10 ${p.W * S + 20} ${p.D * S + 30}`} className="w-full rounded-md border bg-[#f4efe6]">
              {Array.from({ length: Math.floor(p.W) + 1 }, (_, i) => (
                <line key={`x${i}`} x1={i * S} y1={0} x2={i * S} y2={p.D * S} stroke="#e4dccc" />
              ))}
              {Array.from({ length: Math.floor(p.D) + 1 }, (_, j) => (
                <line key={`z${j}`} x1={0} y1={j * S} x2={p.W * S} y2={j * S} stroke="#e4dccc" />
              ))}
              <rect x={0} y={0} width={p.W * S} height={p.D * S} fill="none" stroke="#2a2430" strokeWidth={6} />
              {floor === 0 && <rect x={(p.door - 0.5) * S} y={p.D * S - 4} width={S} height={8} fill="#f4efe6" />}
              {p.rooms
                .filter((r) => r.floor === floor)
                .map((r, k) => (
                  <text key={k} x={(r.x0 + 0.1) * S} y={(r.z0 + 0.3) * S} fontSize={13} fill="#6a5a4a">
                    {r.name}（{r.use}）
                  </text>
                ))}
              {p.dividers
                .filter((d) => d.floor === floor)
                .map((d, k) => (
                  <rect key={k} x={d.x0 * S} y={d.z0 * S} width={(d.x1 - d.x0) * S} height={(d.z1 - d.z0) * S} fill={DIV_COLOR[d.kind]} />
                ))}
              {p.pieces
                .filter((x) => x.floor === floor)
                .map((x, k) => (
                  <g key={k}>
                    <rect
                      x={x.x0 * S}
                      y={x.z0 * S}
                      width={(x.x1 - x.x0) * S}
                      height={(x.z1 - x.z0) * S}
                      fill={x.on ? "#e8b84a55" : x.solid ? "#a88a6a" : "#d8c8a8"}
                      stroke={x.on ? "#c89a2a" : "#5a4a3a"}
                      strokeDasharray={x.solid ? undefined : "3 2"}
                    />
                    <text x={((x.x0 + x.x1) / 2) * S} y={((x.z0 + x.z1) / 2) * S + 4} fontSize={10} textAnchor="middle" fill="#2a2018">
                      {x.name.length > 8 ? x.name.slice(0, 8) + "…" : x.name}
                    </text>
                  </g>
                ))}
            </svg>
          </figure>
        ))}
      </div>
    </section>
  )
}

export const DETAIL: Record<string, ComponentType<{ id: string }>> = { npcs: Resident, maps: Plan, houses: House }
