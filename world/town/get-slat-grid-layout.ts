type Props = { width: number; depth: number; frameWidth: number; frameThickness: number; barWidth: number; barThickness: number; gap: number; footWidth: number; footHeight: number }
type Section = { part: "frame" | "slat" | "foot"; x0: number; x1: number; y0: number; y1: number; z0: number; z1: number }

/** Origin is the frame underside; slats rest above it and corner feet reach down to the tray floor. */
export function getSlatGridLayout(props: Props) {
  if (Object.values(props).some((value) => !Number.isFinite(value) || value <= 0)) return new Error("Invalid slat grid dimensions")
  if (props.footWidth > props.frameWidth || props.frameWidth * 2 + props.barWidth > props.width || props.frameWidth * 2 >= props.depth) return new Error("Slat grid has no clear opening")
  const count = Math.floor((props.width - props.frameWidth * 2 - props.barWidth) / (props.barWidth + props.gap)) + 1
  if (!Number.isSafeInteger(count) || count < 1 || count > 4096) return new Error("Slat grid exceeds its section budget")
  const top = props.frameThickness + props.barThickness
  const height = top + props.footHeight
  if (!Number.isFinite(height)) return new Error("Invalid slat grid dimensions")
  const sections: Section[] = [
    { part: "frame", x0: 0, x1: props.width, y0: 0, y1: props.frameThickness, z0: 0, z1: props.frameWidth },
    { part: "frame", x0: 0, x1: props.width, y0: 0, y1: props.frameThickness, z0: props.depth - props.frameWidth, z1: props.depth },
    { part: "frame", x0: 0, x1: props.frameWidth, y0: 0, y1: props.frameThickness, z0: props.frameWidth, z1: props.depth - props.frameWidth },
    { part: "frame", x0: props.width - props.frameWidth, x1: props.width, y0: 0, y1: props.frameThickness, z0: props.frameWidth, z1: props.depth - props.frameWidth },
  ]
  const slats = Array.from({ length: count }, (_, index): Section => ({
    part: "slat",
    x0: props.frameWidth + index * (props.barWidth + props.gap),
    x1: props.frameWidth + index * (props.barWidth + props.gap) + props.barWidth,
    y0: props.frameThickness,
    y1: top,
    z0: 0,
    z1: props.depth,
  }))

  const feet = [0, 1, 2, 3].map((index): Section => ({
    part: "foot",
    x0: (index % 2) * (props.width - props.footWidth),
    x1: (index % 2) * (props.width - props.footWidth) + props.footWidth,
    z0: Math.floor(index / 2) * (props.depth - props.footWidth),
    z1: Math.floor(index / 2) * (props.depth - props.footWidth) + props.footWidth,
    y0: -props.footHeight,
    y1: 0,
  }))
  return { sections: [...sections, ...slats, ...feet], centers: slats.map((slat) => (slat.x0 + slat.x1) / 2), top, bottom: -props.footHeight, height }
}
