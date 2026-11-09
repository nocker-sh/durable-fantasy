import { getSlatGridLayout } from "#/world/town/get-slat-grid-layout"
import { getRingSlatSupport } from "#/world/town/get-ring-slat-support"
type Bowl = { id: string; centerX: number; centerZ: number; radius: number }
type Props = {
  width: number
  depth: number
  frameWidth: number
  frameThickness: number
  barWidth: number
  gap: number
  margin: number
  footWidth: number
  frameBottom: number
  bowls: readonly Bowl[]
}

/** Derive ring contacts from the actual bars rather than from empty outer bounds. */
export function getDryingGridLayout(props: Props) {
  const grid = getSlatGridLayout({
    width: props.width,
    depth: props.depth,
    frameWidth: props.frameWidth,
    frameThickness: props.frameThickness,
    barWidth: props.barWidth,
    barThickness: props.barWidth,
    gap: props.gap,
    footWidth: props.footWidth,
    footHeight: props.frameBottom,
  })
  if (grid instanceof Error) return grid
  if (!Number.isFinite(props.margin) || props.margin <= 0) return new Error("Invalid ring support margin")
  const supports: { id: string; support: Exclude<ReturnType<typeof getRingSlatSupport>, Error> }[] = []
  for (const bowl of props.bowls) {
    const support = getRingSlatSupport({ centerX: bowl.centerX, centerZ: bowl.centerZ, radius: bowl.radius, margin: props.margin, depth: props.depth, centers: grid.centers })
    if (support instanceof Error) return new Error(`${bowl.id}: ${support.message}`)
    supports.push({ id: bowl.id, support })
  }

  return { grid, supports }
}
