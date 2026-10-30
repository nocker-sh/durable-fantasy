type Props = Readonly<{ washMl: number; rinseMl: number; rinseChanges: number; handwashMl: number; supplyMl: number; effluentMl: number; batchesBeforeService: number }>

/** Reserve all supplied water as possible effluent, including later drips; evaporation never creates disposal capacity in this proposal. */
export function getWoolPreparationWaterBudget(props: Props) {
  if (![props.washMl, props.rinseMl, props.rinseChanges, props.handwashMl, props.supplyMl, props.effluentMl, props.batchesBeforeService].every((value) => Number.isSafeInteger(value) && value > 0))
    return new Error("Invalid wool preparation water budget")
  const perBatchMl = props.washMl + props.rinseMl * props.rinseChanges + props.handwashMl,
    reservedMl = perBatchMl * props.batchesBeforeService
  if (!Number.isSafeInteger(perBatchMl) || !Number.isSafeInteger(reservedMl)) return new Error("Unbounded wool preparation water budget")
  if (reservedMl > props.supplyMl) return new Error("Wool preparation exceeds reserved fresh water")
  if (reservedMl > props.effluentMl) return new Error("Wool preparation exceeds retained effluent capacity")

  return { perBatchMl, reservedMl, unreservedSupplyMl: props.supplyMl - reservedMl, unreservedEffluentMl: props.effluentMl - reservedMl }
}
