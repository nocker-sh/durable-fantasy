type Props = Readonly<{ first: number; last: number; going: number; threshold: number }>

/** Search tread numbers in [first, last); last is the sentinel when no tread crosses the lower ceiling boundary. */
export function getFirstCoveredStairTread(props: Props): number {
  if (![props.first, props.last].every(Number.isSafeInteger) || props.first < 1 || props.last < props.first || !Number.isFinite(props.going) || props.going <= 0 || !Number.isFinite(props.threshold))
    throw new RangeError("Invalid stair tread search bounds")
  if (props.first === props.last) return props.last

  const middle = props.first + Math.floor((props.last - props.first) / 2)
  if (middle * props.going > props.threshold) return getFirstCoveredStairTread({ ...props, last: middle })

  return getFirstCoveredStairTread({ ...props, first: middle + 1 })
}
