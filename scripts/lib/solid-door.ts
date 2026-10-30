type Point = readonly [number, number]
const EPS = 1e-9,
  HALF_PI = Math.PI / 2
function contactAngles(a: number, b: number, c: number): number[] {
  const radius = Math.hypot(a, b)
  if (radius < EPS || Math.abs(c) > radius + EPS) return []
  const phase = Math.atan2(b, a),
    offset = Math.acos(Math.max(-1, Math.min(1, c / radius))),
    roots: number[] = []
  for (const sign of [-1, 1])
    for (const turn of [-1, 0, 1]) {
      const angle = phase + sign * offset + turn * 2 * Math.PI
      if (angle >= -EPS && angle <= HALF_PI + EPS) roots.push(Math.max(0, Math.min(HALF_PI, angle)))
    }
  return roots
}
/** Contact angles partition the motion; testing the intervening intervals cannot skip a collision. */
export function solidLeafHitsBox(radius: number, thickness: number, box: readonly [number, number, number, number]): boolean {
  const x0State = box,
    x0 = x0State[0],
    y0 = x0State[1],
    x1 = x0State[2],
    y1 = x0State[3],
    half = thickness / 2
  const fixed: Point[] = [
      [x0, y0],
      [x1, y0],
      [x0, y1],
      [x1, y1],
    ],
    leaf: Point[] = [
      [0, -half],
      [radius, -half],
      [0, half],
      [radius, half],
    ]
  const angles = [0, HALF_PI]
  for (const entry of leaf) {
    const x = entry[0]
    const y = entry[1]

    for (const bound of [x0, x1]) angles.push(...contactAngles(x, -y, bound))
    for (const bound of [y0, y1]) angles.push(...contactAngles(y, x, bound))
  }
  for (const entry2 of fixed) {
    const x = entry2[0]
    const y = entry2[1]

    for (const bound of [0, radius]) angles.push(...contactAngles(x, y, bound))
    for (const bound of [-half, half]) angles.push(...contactAngles(y, -x, bound))
  }
  const contacts = [...new Set(angles)].sort((a, b) => a - b),
    samples = [...contacts, ...contacts.slice(1).map((angle, i) => (angle + contacts[i]) / 2)]
  return samples.some((angle) => {
    const c = Math.cos(angle),
      s = Math.sin(angle),
      moving = leaf.map((entry3): Point => {
        const x = entry3[0]
        const y = entry3[1]
        return [x * c - y * s, x * s + y * c]
      })
    return (
      [
        [1, 0],
        [0, 1],
        [c, s],
        [-s, c],
      ] as Point[]
    ).every((entry4) => {
      const ax = entry4[0]
      const ay = entry4[1]

      const a = fixed.map((entry5) => {
          const x = entry5[0]
          const y = entry5[1]
          return x * ax + y * ay
        }),
        b = moving.map((entry6) => {
          const x = entry6[0]
          const y = entry6[1]
          return x * ax + y * ay
        })
      return Math.min(Math.max(...a), Math.max(...b)) - Math.max(Math.min(...a), Math.min(...b)) > EPS
    })
  })
}
