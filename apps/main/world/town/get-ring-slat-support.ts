type Props = { centerX: number; centerZ: number; radius: number; margin: number; depth: number; centers: readonly number[] }

/** Centerline contacts enclose a central rectangle under a symmetric ring's vertical load; strength is separate. */
export function getRingSlatSupport(props: Props) {
  if (
    ![props.centerX, props.centerZ, props.radius, props.margin, props.depth].every(Number.isFinite) ||
    !props.centers.every(Number.isFinite) ||
    props.radius <= props.margin ||
    props.margin <= 0 ||
    props.depth <= 0
  )
    return new Error("Invalid ring support dimensions")
  const contacts = props.centers.flatMap((x) => {
    const distance = Math.abs(x - props.centerX)
    if (distance >= props.radius) return []
    const halfSpan = Math.sqrt((props.radius - distance) * (props.radius + distance))
    if (!Number.isFinite(halfSpan) || halfSpan < props.margin || props.centerZ - halfSpan < 0 || props.centerZ + halfSpan > props.depth) return []
    return [{ x, halfSpan }]
  })
  const left = contacts.find((contact) => contact.x <= props.centerX - props.margin)
  const right = contacts.find((contact) => contact.x >= props.centerX + props.margin)
  if (!left || !right) return new Error("Grid contacts do not enclose the bowl center with its support margin")
  const halfSpan = Math.min(left.halfSpan, right.halfSpan)
  const supportRect = { x0: left.x, x1: right.x, z0: props.centerZ - halfSpan, z1: props.centerZ + halfSpan }

  return {
    contacts: [
      [left.x, props.centerZ - left.halfSpan],
      [left.x, props.centerZ + left.halfSpan],
      [right.x, props.centerZ - right.halfSpan],
      [right.x, props.centerZ + right.halfSpan],
    ] satisfies [number, number][],
    supportRect,
  }
}
