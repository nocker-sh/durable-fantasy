import { Group, Mesh } from "three"
import { PARKED_CART_SHAPE } from "#/world/town/parked-cart-shape"
import { getParkedCartFit } from "#/world/town/get-parked-cart-fit"
import { parkedCartWheel } from "#/world/scene/construction/parked-cart-wheel"
import { parkedCartFrame } from "#/world/scene/construction/parked-cart-frame"
type Props = Readonly<{ at: readonly [number, number]; size: readonly [number, number]; floor: number }>

/** An empty parked cart keeps its shafts and supports inside the authored footprint; no cargo is invented. */
export function parkedCart(props: Props): Group | Error {
  const fit = getParkedCartFit(props.size)
  if (fit instanceof Error) return fit
  if (![...props.at, props.floor].every((value) => Number.isFinite(value) && Number.isFinite(Math.fround(value)))) return new Error("Invalid parked cart position")
  const root = new Group()
  root.name = "parked-cart"
  root.position.set(props.at[0], props.floor, props.at[1])
  root.scale.setScalar(fit.scale)
  root.rotation.y = fit.turn
  root.add(parkedCartFrame())
  for (const side of [-1, 1]) {
    const wheel = parkedCartWheel(),
      shape = PARKED_CART_SHAPE.wheel
    wheel.name = `wheel-${side}`
    wheel.position.set(side * shape.x, shape.y, shape.z)
    root.add(wheel)
  }
  root.traverse((object) => {
    if (object instanceof Mesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })

  return root
}
