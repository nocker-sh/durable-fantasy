import { Group, LatheGeometry, Mesh, Vector2 } from "three"
import { WATER_JAR_SHAPE } from "#/world/town/water-jar-shape"
import { M } from "#/world/scene/construction/materials"
type Props = Readonly<{ at: readonly [number, number]; size: readonly [number, number]; floor: number }>
const PROFILE_EXTENT = Math.max(...WATER_JAR_SHAPE.flatMap((part) => part.profile.flatMap((point) => [...point])))

/** A ceramic storage vessel, not a wooden barrel; the closed lid rests on its rim without changing the walk footprint. */
export function waterJar(props: Props): Group | Error {
  const diameter = Math.min(...props.size)
  if (![...props.at, ...props.size, props.floor, diameter * PROFILE_EXTENT].every((value) => Number.isFinite(value) && Number.isFinite(Math.fround(value))) || props.size.some((size) => size <= 0))
    return new Error("Invalid water jar placement or dimensions")
  const root = new Group()
  root.name = "water-jar"
  root.position.set(props.at[0], props.floor, props.at[1])
  for (const part of WATER_JAR_SHAPE) {
    const source = new LatheGeometry(
        part.profile.map((point) => new Vector2(point[0] * diameter, point[1] * diameter)),
        10,
      ),
      geometry = source.toNonIndexed()
    source.dispose()
    geometry.computeVertexNormals()
    const mesh = new Mesh(geometry, M.ceramic)
    mesh.name = part.name
    mesh.castShadow = true
    mesh.receiveShadow = true
    root.add(mesh)
  }

  return root
}
