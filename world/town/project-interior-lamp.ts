import type { LampFixture } from "#/world/town/room-fixtures"

type Props = Readonly<{ lamp: LampFixture; x0: number; z0: number; scale: number }>

/** Translate a lamp's horizontal position and scale each physical dimension once. */
export function projectInteriorLamp(props: Props): LampFixture {
  const lamp = props.lamp,
    scale = props.scale
  return { ...lamp, x: props.x0 + lamp.x * scale, z: props.z0 + lamp.z * scale, bottom: lamp.bottom * scale, top: lamp.top * scale, diameter: lamp.diameter * scale, ceiling: lamp.ceiling * scale }
}
