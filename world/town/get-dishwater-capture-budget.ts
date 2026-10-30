type Props = Readonly<{ washMl: number; reservedBatches: number; basinCapacityMl: number; receiverCapacityMl: number; initialRetainedMl: number }>

/** Retain every reserved millilitre, including later drips; this establishes neither fresh-water supply nor repeatable disposal. */
export function getDishwaterCaptureBudget(props: Props) {
  if (![props.washMl, props.reservedBatches, props.basinCapacityMl, props.receiverCapacityMl].every((value) => Number.isSafeInteger(value) && value > 0))
    return new Error("Invalid dishwater capture budget")
  if (!Number.isSafeInteger(props.initialRetainedMl) || props.initialRetainedMl < 0) return new Error("Invalid initial retained dishwater")
  const requiredFreshMl = props.washMl * props.reservedBatches,
    retainedMl = props.initialRetainedMl + requiredFreshMl
  if (!Number.isSafeInteger(requiredFreshMl) || !Number.isSafeInteger(retainedMl)) return new Error("Unbounded dishwater reservation")
  if (props.washMl > props.basinCapacityMl) return new Error("Reserved wash exceeds basin working capacity")
  if (retainedMl > props.receiverCapacityMl) return new Error("Reserved dishwater exceeds retained effluent capacity")

  return { requiredFreshMl, retainedMl, remainingRetentionMl: props.receiverCapacityMl - retainedMl }
}
