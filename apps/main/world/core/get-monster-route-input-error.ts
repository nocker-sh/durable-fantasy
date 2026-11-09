type Props = Readonly<{ from: readonly [number, number]; to: readonly [number, number]; area: readonly [number, number, number, number]; radius: number }>

/** Territory bounds constrain resting centres, not the body's radius; point territories and exact boundary rests remain valid. */
export function getMonsterRouteInputError(props: Props): Error | null {
  if (![...props.from, ...props.to, ...props.area, props.radius].every(Number.isFinite) || props.radius < 0 || props.area[0] > props.area[2] || props.area[1] > props.area[3])
    return new Error("Invalid monster route territory or endpoint")
  for (const point of [props.from, props.to]) {
    if (point[0] < props.area[0] || point[1] < props.area[1] || point[0] > props.area[2] || point[1] > props.area[3]) return new Error("Invalid monster route territory or endpoint")
  }

  return null
}
