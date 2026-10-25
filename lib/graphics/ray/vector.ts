type V3 = [number, number, number]

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]

const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

// ---------------------------------------------------------------- body assembly

/** head frame: columns are the head's right, up and forward axes in world space */
type M3 = [V3, V3, V3]

const mv = (M: M3, v: V3): V3 => [M[0][0] * v[0] + M[1][0] * v[1] + M[2][0] * v[2], M[0][1] * v[0] + M[1][1] * v[1] + M[2][1] * v[2], M[0][2] * v[0] + M[1][2] * v[1] + M[2][2] * v[2]]

const mtv = (M: M3, v: V3): V3 => [dot(M[0], v), dot(M[1], v), dot(M[2], v)]

export { type V3, add, sub, mul, dot, cross, norm, lerp3, type M3, mv, mtv }
