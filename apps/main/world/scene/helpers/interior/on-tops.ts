import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { Interior } from "#/world/town/interiors"
import { goodsOf } from "#/world/scene/helpers/interior/goods-of"
import { TOPS } from "#/world/scene/interior"
import { topOf } from "#/world/scene/construction/top-of"
import { spotOf } from "#/world/scene/helpers/interior/spot-of"
import { Kit } from "#/world/scene/construction/kit"
import { hash2 } from "#/lib/engine/hash2"
import { lying } from "#/world/scene/construction/lying"
export function onTops(gb: GB, it: Interior, y0: number, seed: number) {
  const own = goodsOf(it)
  it.furniture.forEach((f, k) => {
    const name = f.name ?? ""
    const kind = TOPS.find(([re]) => re.test(name))
    if (!kind) return
    const top = topOf(name) ?? 0.9
    const s = spotOf(it, f, y0)
    const frame = new Kit(gb, s)
    const corners: [number, number][] = [
      [-0.32, 0.12],
      [0.32, -0.12],
      [0.36, 0.16],
    ]
    const n = frame.W > 1.2 ? 3 : 2
    for (let i = 0; i < n; i++) {
      const [cu, cv] = corners[i]
      const [x, z] = frame.at(cu * frame.W, cv * frame.D)
      const pool = i === 0 && own.length ? own : kind[1]
      const what = pool[Math.floor(hash2(seed + k, i, 97) * pool.length) % pool.length]
      lying(
        new Kit(
          gb,
          {
            x,
            z,
            w: 0.3,
            d: 0.25,
            y: y0 + top,
            face: s.face,
          },
          1.1,
        ),
        what,
        seed + k * 7 + i,
      )
    }
  })
}
