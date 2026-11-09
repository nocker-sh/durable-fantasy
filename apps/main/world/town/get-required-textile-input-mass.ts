type Props = Readonly<{ outputG: number; yieldPermille: number }>

/** Round the required whole-gram input upward without overflowing an intermediate multiplication. */
export function getRequiredTextileInputMass(props: Props): number | Error {
  if (!Number.isSafeInteger(props.outputG) || props.outputG <= 0 || !Number.isSafeInteger(props.yieldPermille) || props.yieldPermille <= 0 || props.yieldPermille > 1000)
    return new Error("Invalid textile process mass or yield")
  const denominator = BigInt(props.yieldPermille),
    required = (BigInt(props.outputG) * 1000n + denominator - 1n) / denominator
  if (required > BigInt(Number.MAX_SAFE_INTEGER)) return new Error("Unbounded textile input mass")

  return Number(required)
}
