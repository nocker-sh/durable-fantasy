import { Kit } from "#/world/scene/construction/kit"

/** A row of things along a board: what each is, given where it is and which one it is. */
type Props = {
  k: Kit
  y: number
  from: number
  to: number
  put: (u: number, i: number) => number
}

export function row(props: Props) {
  const u = { value: props.from }
  for (const i = { value: 0 }; u.value < props.to; i.value++) u.value += props.put(u.value, i.value)
}
