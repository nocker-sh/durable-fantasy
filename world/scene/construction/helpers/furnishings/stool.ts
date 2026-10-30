import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

// ---------------------------------------------------------------- what the shops and rooms came to need

export function stool(k: Kit, wd: Wood) {
  // three splayed legs and a round seat
  const rr = Math.min(k.W, k.D) / 2 - 0.02
  for (const t = { value: 0 }; t.value < 3; t.value++) {
    const a = (t.value / 3) * Math.PI * 2 + 0.3
    k.box({ side: wd.dark, top: null, u0: Math.cos(a) * rr * 0.7 - 0.025, y0: 0, v0: Math.sin(a) * rr * 0.7 - 0.025, u1: Math.cos(a) * rr * 0.7 + 0.025, y1: 0.44, v1: Math.sin(a) * rr * 0.7 + 0.025 })
  }
  k.cyl({ side: wd.body, top: wd.top, u: 0, v: 0, y0: 0.44, y1: 0.48, r0: rr, r1: rr, seg: 9 })
}
