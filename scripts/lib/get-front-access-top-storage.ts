import { cuboidTranslationHits } from "../../lib/engine/cuboid-translation-hits"
import { getFrontAccessSpareBlanketPlacement } from "#/scripts/lib/get-front-access-spare-blanket-placement"
import { getFrontAccessSparePillowCoverPlacement } from "#/scripts/lib/get-front-access-spare-pillow-cover-placement"
import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
type Props = Parameters<typeof getFrontAccessSpareBlanketPlacement>[0]

/** All top packages share one cabinet plane; each must fit without borrowing another package's space. */
export function getFrontAccessTopStorage(props: Props) {
  const spareBlanket = getFrontAccessSpareBlanketPlacement(props)
  if (spareBlanket instanceof Error) return spareBlanket
  const sparePillowCover = getFrontAccessSparePillowCoverPlacement(props)
  if (sparePillowCover instanceof Error) return sparePillowCover
  const packages = [spareBlanket, sparePillowCover].filter((pack) => pack !== null)
  const bounds = props.spec.bounds,
    layout = getBoxLayoutError({
      size: [bounds.x1 - bounds.x0, props.section.ceiling - bounds.top, bounds.z1 - bounds.z0],
      boxes: packages.map((pack) => ({ id: pack.source.id, origin: pack.source.position_m, size: pack.size })),
      gap: props.slot.packing?.clearance_m ?? 0,
    })
  if (layout) return layout
  if (spareBlanket && sparePillowCover && cuboidTranslationHits({ relative: sparePillowCover.lidSweep, from: [0, 0, 0], to: [0, 0, 0], obstacle: spareBlanket.box }))
    return new Error("Pillow cover lid sweep intersects the spare blanket")

  return { spareBlanket, sparePillowCover, boxes: packages.map((pack) => pack.box) }
}
