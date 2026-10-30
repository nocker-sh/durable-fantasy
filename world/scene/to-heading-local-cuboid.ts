import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { box: Cuboid; root: Point3; heading: number }

/** All eight corners enclose the rotated solid; cardinal chair headings retain their exact rectangular shape. */
export function toHeadingLocalCuboid(props: Props): Cuboid | Error {
  const box = props.box
  if (![box.x0, box.x1, box.bottom, box.top, box.z0, box.z1, ...props.root, props.heading].every(Number.isFinite) || box.x0 >= box.x1 || box.bottom >= box.top || box.z0 >= box.z1)
    return new Error("Invalid heading cuboid")
  const corners = [box.x0, box.x1].flatMap((x) => [box.bottom, box.top].flatMap((y) => [box.z0, box.z1].map((z) => toHeadingLocalPoint([x, y, z], props.root, props.heading))))

  return {
    x0: Math.min(...corners.map((point) => point[0])),
    x1: Math.max(...corners.map((point) => point[0])),
    bottom: Math.min(...corners.map((point) => point[1])),
    top: Math.max(...corners.map((point) => point[1])),
    z0: Math.min(...corners.map((point) => point[2])),
    z1: Math.max(...corners.map((point) => point[2])),
  }
}
