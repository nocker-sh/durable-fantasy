type Props = Readonly<{ point: readonly number[] | undefined; end: "start" | "end"; rect: readonly number[]; scale: number; along: 0 | 1; landingDepth: number }>

/** Project the local use position along the stair while retaining the existing end-landing convention. */
export function getStairLandingError(props: Props): string | null {
  if (!props.point) return "Stair landing has no access position"

  const endLength = props.rect[2 + props.along] * props.scale
  const position = Math.max(0, Math.min(endLength, (props.point[props.along] - props.rect[props.along] + 0.5) * props.scale))
  if (props.end === "start" && position > props.landingDepth) return "Stair access does not meet its end landing"
  if (props.end === "end" && position < endLength - props.landingDepth) return "Stair access does not meet its end landing"

  return null
}
