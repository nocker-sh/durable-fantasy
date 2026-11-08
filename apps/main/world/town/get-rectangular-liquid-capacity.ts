type Props = Readonly<{ innerMm: readonly [number, number, number]; wallMm: number; bottomMm: number; freeboardMm: number; displacementMl: number }>

/** Reserve headroom and displaced contents; round down only after exact cubic-millimetre arithmetic. This is nominal geometry, not a load or manufacturing certificate. */
export function getRectangularLiquidCapacity(props: Props) {
  if (
    ![...props.innerMm, props.wallMm, props.bottomMm, props.freeboardMm].every((value) => Number.isSafeInteger(value) && value > 0) ||
    !Number.isSafeInteger(props.displacementMl) ||
    props.displacementMl < 0
  )
    return new Error("Invalid liquid vessel dimensions")
  const width = props.innerMm[0] + 2 * props.wallMm,
    height = props.innerMm[1] + props.bottomMm,
    depth = props.innerMm[2] + 2 * props.wallMm
  if (![width, height, depth].every(Number.isSafeInteger) || props.freeboardMm >= props.innerMm[1]) return new Error("Liquid vessel has no bounded working cavity")
  const cavityMl = (BigInt(props.innerMm[0]) * BigInt(props.innerMm[1] - props.freeboardMm) * BigInt(props.innerMm[2])) / 1000n,
    capacityMl = cavityMl - BigInt(props.displacementMl)
  if (capacityMl <= 0n || cavityMl > BigInt(Number.MAX_SAFE_INTEGER)) return new Error("Liquid vessel has no bounded working capacity")

  return { outerMm: [width, height, depth] satisfies readonly [number, number, number], capacityMl: Number(capacityMl) }
}
