import type { Line, Situation } from "#/world/town/lines/line"
import { fit } from "#/world/town/lines/fit"

type Props = {
  lines: readonly Line[]
  s: Situation
  pages?: number
  seed?: number
}

/**
 * What to say this time: up to `pages` lines, the most fitting first, then others that fit, each
 * conversation a little different (`seed`), never the same line twice in one go.
 */
export function pick(props: Props): string[] {
  const pages = props.pages === undefined ? 3 : props.pages
  const seed = props.seed === undefined ? 0 : props.seed

  const scored = props.lines.map((l, i) => ({ l, i, f: fit(l, props.s) })).filter((x) => x.f >= 0)
  const rand = (i: number) => {
    const x = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  scored.sort((a, b) => b.f - a.f || rand(a.i) - rand(b.i))
  const best = scored.filter((x) => x.f > 0).slice(0, 1)
  const rest = scored.filter((x) => !best.includes(x)).sort((a, b) => rand(a.i) - rand(b.i))
  return [...best, ...rest].slice(0, pages).map((x) => x.l.text)
}
