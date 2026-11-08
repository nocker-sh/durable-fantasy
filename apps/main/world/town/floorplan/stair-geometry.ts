import type { Rect } from "#/world/town/floorplan/types"

export type StairSection = Rect & {
  id: string
  lowerFloor: number
  upperFloor: number
  slabThickness: number
  height: number
  risers: number
  going: number
  axis: "x" | "z"
  lowerEnd: "start" | "end"
  landing: number
  clearWidth: number
  railInset: number
  openingLength: number
}
export type StairGeometry = {
  section: StairSection
  steps: (Rect & { height: number })[]
  upperLanding: Rect
  lowerLanding: Rect
  flight: Rect
  opening: Rect
}

/** One physical flight shared by its two floors, in metres. */
export function stairGeometry(s: StairSection): StairGeometry {
  const alongX = s.axis === "x",
    start = alongX ? s.x0 : s.z0,
    end = alongX ? s.x1 : s.z1
  const width = alongX ? s.z1 - s.z0 : s.x1 - s.x0,
    length = end - start,
    run = (s.risers - 1) * s.going
  if (
    ![s.slabThickness, s.x0, s.x1, s.z0, s.z1, s.height, s.going, s.landing, s.clearWidth, s.railInset, s.openingLength].every(Number.isFinite) ||
    !Number.isSafeInteger(s.risers) ||
    s.risers < 2 ||
    !Number.isSafeInteger(s.lowerFloor) ||
    s.lowerFloor < 0 ||
    s.slabThickness <= 0 ||
    s.slabThickness >= s.height ||
    s.height <= 0 ||
    s.going <= 0 ||
    s.landing <= 0 ||
    width <= 0 ||
    s.clearWidth <= 0 ||
    s.railInset <= 0 ||
    s.clearWidth > width - 2 * s.railInset + 1e-9 ||
    run + 2 * s.landing > length + 1e-9 ||
    s.openingLength < 0 ||
    s.openingLength > run + 1e-9 ||
    s.upperFloor !== s.lowerFloor + 1
  )
    throw new Error(`Invalid stair section: ${s.id}`)
  const rect = (a: number, b: number): Rect => {
    const loState = s.lowerEnd === "end" ? [start + a, start + b] : [end - b, end - a],
      lo = loState[0],
      hi = loState[1]
    return alongX ? { x0: lo, x1: hi, z0: s.z0, z1: s.z1 } : { x0: s.x0, x1: s.x1, z0: lo, z1: hi }
  }
  const steps = Array.from({ length: s.risers - 1 }, (_, i) => ({ ...rect(s.landing + i * s.going, s.landing + (i + 1) * s.going), height: (s.height * (s.risers - i - 1)) / s.risers }))
  return {
    section: s,
    steps,
    upperLanding: rect(0, s.landing),
    lowerLanding: rect(s.landing + run, length),
    flight: rect(s.landing, s.landing + run),
    opening: rect(s.landing, s.landing + s.openingLength),
  }
}
