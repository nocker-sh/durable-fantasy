import { Kit } from "#/world/scene/construction/kit"
import { herb, onion, garlic } from "#/world/scene/construction/belongings"
import { r } from "#/world/scene/construction/helpers/belongings/r"
import { pick } from "#/world/scene/construction/helpers/belongings/pick"
import { bunch } from "#/world/scene/construction/helpers/belongings/bunch"
import { string } from "#/world/scene/construction/helpers/belongings/string"

/** Hung from the beams, by the room's use: onions and garlic in a kitchen, herbs to dry anywhere they are kept. */
type Props = {
  k: Kit
  use: string
  seed: number
  apothecary?: boolean
}

export function fromBeams(props: Props) {
  const apothecary = props.apothecary === undefined ? false : props.apothecary

  const n = 2 + Math.floor(r(props.seed, 11) * 3)
  for (const i = { value: 0 }; i.value < n; i.value++) {
    const u = (i.value - (n - 1) / 2) * 0.35
    if (apothecary || props.use === "貯蔵") bunch({ k: props.k, m: pick(herb, props.seed, i.value), u: u, len: 0.35, n: 6, seed: props.seed + i.value })
    else if (props.use === "台所") string({ k: props.k, m: i.value % 2 ? garlic : onion, u: u, n: 5 })
    else if (r(props.seed, i.value + 20) > 0.5) bunch({ k: props.k, m: pick(herb, props.seed, i.value), u: u, len: 0.3, n: 5, seed: props.seed + i.value })
  }
}
