type Props = {
  width: number
  depth: number
  railHeight: number
  railLength: number
  railDiameter: number
  rails: readonly number[]
  clothWidth: number
  clothLength: number
  clothThickness: number
  airGap: number
  trayInset: number
  trayTop: number
  floorClearance: number
}

/** Fold cloth over separate rails; reserve its full hanging envelope and contain the vertical drip projection above the tray. */
export function getClothDryingLayout(props: Props) {
  const dimensions = [
    props.width,
    props.depth,
    props.railHeight,
    props.railLength,
    props.railDiameter,
    props.clothWidth,
    props.clothLength,
    props.clothThickness,
    props.airGap,
    props.trayInset,
    props.trayTop,
    props.floorClearance,
  ]
  if (dimensions.some((value) => !Number.isFinite(value) || value <= 0) || !props.rails.length || props.rails.some((position) => !Number.isFinite(position)))
    return new Error("Invalid cloth drying dimensions")
  if (props.railLength > props.depth || props.clothWidth > props.railLength) return new Error("Drying cloth extends beyond its rail")
  const halfThickness = props.railDiameter / 2 + props.clothThickness
  const bottom = props.railHeight - props.clothLength / 2
  if (bottom < props.floorClearance || bottom <= props.trayTop) return new Error("Drying cloth touches the tray or floor clearance")
  const panels = props.rails.map((position) => ({
    x0: position - halfThickness,
    x1: position + halfThickness,
    z0: (props.depth - props.clothWidth) / 2,
    z1: (props.depth + props.clothWidth) / 2,
    y0: bottom,
    y1: props.railHeight + halfThickness,
  }))
  if (panels.some((panel) => Object.values(panel).some((coordinate) => !Number.isFinite(coordinate)))) return new Error("Invalid cloth drying dimensions")
  if (panels.some((panel) => panel.x0 < props.trayInset || panel.x1 > props.width - props.trayInset || panel.z0 < props.trayInset || panel.z1 > props.depth - props.trayInset))
    return new Error("Drying cloth drips outside its tray")
  for (const first of panels.keys())
    for (const second of panels.keys()) {
      if (second > first && Math.abs(props.rails[first] - props.rails[second]) - halfThickness * 2 < props.airGap) return new Error("Drying cloth panels have insufficient air gap")
    }

  return { panels, tray: { x0: props.trayInset, x1: props.width - props.trayInset, z0: props.trayInset, z1: props.depth - props.trayInset, top: props.trayTop } }
}
