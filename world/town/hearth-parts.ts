import { hearthChamber } from "#/world/town/hearth-chamber"
import { flueWalls } from "#/world/town/flue-walls"
import { subtractCuboids, type Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { HearthPartsInput } from "#/world/town/hearth-types"
export function hearthParts(props: HearthPartsInput) {
  const chamber = hearthChamber({ bounds: props.bounds, front: props.front, spec: props.spec, bottom: props.bottom })
  const duct = flueWalls(props.shaft, props.shaft.wallThickness).duct
  if (duct.x0 < chamber.x0 - 1e-9 || duct.x1 > chamber.x1 + 1e-9 || duct.z0 < chamber.z0 - 1e-9 || duct.z1 > chamber.z1 + 1e-9) throw new Error("Hearth chamber does not join its full flue duct")
  const throat: Cuboid = { ...duct, bottom: chamber.top, top: props.bottom + props.spec.height }
  return { chamber, throat, masonry: subtractCuboids({ ...props.bounds, bottom: props.bottom, top: props.bottom + props.spec.height }, [chamber, throat]) }
}
