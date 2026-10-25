import { useEffect, useRef } from "react"
import { DevPage } from "#/dev/catalog.tsx"
import { FH, FW, buildSheetStrip, type Look } from "#/world/scene/figure.ts"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents.ts"

/** The eyes (ui.md §6.4.2): each resident from all eight sides, the old upright stroke above the T. ?scale=6 */
const VIEWS = [0, 1, 2, 3, 4, 5, 6, 7]

function Face({ look, item, view, scale }: { look: Look; item: Parameters<typeof buildSheetStrip>[2]; view: number; scale: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const strip = buildSheetStrip(look, "idle", item, view)
    const c = ref.current!
    // the head and shoulders of the first frame
    // the head: from the first opaque row down, the middle of the frame across
    let top = 0
    while (top < FH && ![...Array(FW).keys()].some((x) => strip.data[(top * strip.w + x) * 4 + 3])) top++
    const w = 36,
      x0 = Math.round(FW / 2 - w / 2),
      h = 30
    c.width = w
    c.height = h
    const img = new ImageData(new Uint8ClampedArray(w * h * 4), w, h)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let k = 0; k < 4; k++) img.data[(y * w + x) * 4 + k] = strip.data[((y + top - 2) * strip.w + x + x0) * 4 + k] ?? 0
    c.getContext("2d")!.putImageData(img, 0, 0)
  }, [look, item, view])
  return <canvas ref={ref} style={{ width: 36 * scale, imageRendering: "pixelated" }} className="rounded bg-[#3a4a3a]" />
}

export default function EyesPage() {
  return (
    <DevPage>
      {() => {
        const scale = Number(new URLSearchParams(location.search).get("scale") ?? 5)
        const trial = RESIDENTS.map((r, i) => ({ r, look: RESIDENT_LOOKS[i] }))
        return (
          <div className="grid gap-6 text-sm">
            {trial.map(({ r, look }) => (
              <section key={r.name} className="grid gap-1">
                <h3 className="font-semibold">
                  {r.name}（{r.job}・瞳 {look.eye}）
                </h3>
                <div className="flex flex-wrap gap-1">
                  {VIEWS.map((v) => (
                    <Face key={v} look={{ ...look, eyeStyle: "stroke" }} item={r.item} view={v} scale={scale} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {VIEWS.map((v) => (
                    <Face key={v} look={look} item={r.item} view={v} scale={scale} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      }}
    </DevPage>
  )
}
