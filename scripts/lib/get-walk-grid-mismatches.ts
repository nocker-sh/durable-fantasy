type Props = Readonly<{ map: string; blocked: string; size: number; rows: readonly string[] }>

/** The [x, z] cells where a rendered walk grid ("1" blocked, row after row) and a published one ("#" blocked) disagree. */
export function getWalkGridMismatches(props: Props): [number, number][] {
  if (props.rows.length !== props.size || props.blocked.length !== props.size * props.size) throw new Error(`Grid dimensions differ: ${props.map}`)
  const mismatches: [number, number][] = []
  for (let z = 0; z < props.size; z++)
    for (let x = 0; x < props.size; x++) {
      if ((props.blocked[z * props.size + x] === "1") !== (props.rows[z][x] === "#")) mismatches.push([x, z])
    }
  return mismatches
}
