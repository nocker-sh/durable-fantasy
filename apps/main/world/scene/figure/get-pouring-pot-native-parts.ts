import { getPouringPotNativePoint } from "#/world/scene/figure/get-pouring-pot-native-point"
import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Omit<Parameters<typeof getPouringPotNativePoint>[0], "point"> & { profile: Exclude<ReturnType<typeof getPouringPotProfile>, Error> }

/** The rotated eight-corner envelope encloses the whole body and lip; every handle section retains its actual capsule. */
export function getPouringPotNativeParts(props: Props) {
  const p = props.profile.dimensions,
    corners = [-p.diameter / 2, p.diameter / 2 + p.lipLength].flatMap((x) =>
      [0, p.height].flatMap((y) => [-p.diameter / 2, p.diameter / 2].map((z) => getPouringPotNativePoint({ ...props, point: [x, y, z] }))),
    )
  if (corners.some((point) => !point.every(Number.isFinite))) return new Error("Invalid native pouring pot transform")
  const body: Cuboid = {
    x0: Math.min(...corners.map((point) => point[0])),
    x1: Math.max(...corners.map((point) => point[0])),
    bottom: Math.min(...corners.map((point) => point[1])),
    top: Math.max(...corners.map((point) => point[1])),
    z0: Math.min(...corners.map((point) => point[2])),
    z1: Math.max(...corners.map((point) => point[2])),
  }
  const bars = props.profile.handle.map((section) => ({ ...section, from: getPouringPotNativePoint({ ...props, point: section.from }), to: getPouringPotNativePoint({ ...props, point: section.to }) }))

  return { body, bars }
}
