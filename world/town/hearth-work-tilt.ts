type Props = {
  reach: number
  gripHeight: number
  floor: number
  thickness: number
}

/** Solve the tilted blade's rear and lower contact planes without pushing a corner into the masonry. */
export function hearthWorkTilt(props: Props) {
  const half = props.thickness / 2,
    h = props.gripHeight - props.floor
  if (![props.reach, props.gripHeight, props.floor, props.thickness].every(Number.isFinite) || props.thickness <= 0 || props.reach <= props.thickness || h < half)
    throw new Error("Invalid working tool height")
  const interval = { low: 0, high: Math.PI / 2 - 1e-8 }
  for (const _iteration of Array.from({ length: 64 })) {
    const angle = (interval.low + interval.high) / 2,
      value = props.reach * Math.tan(angle) + (half * Math.cos(2 * angle)) / Math.cos(angle)
    if (value > h) interval.high = angle
    else interval.low = angle
  }
  const angle = (interval.low + interval.high) / 2,
    gripFromBlade = (props.reach - half * Math.sin(angle)) / Math.cos(angle)
  return { angle, gripFromBlade }
}
