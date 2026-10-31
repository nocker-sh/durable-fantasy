import { INDOOR_SIZE } from "#/world/town/interior-rules"
import { outsideDoor } from "#/world/town/outside-door"
import type { MapDefinition } from "#/world/maps/types"
import type { Cell } from "#/world/town/interiors"
import type { IndoorMapOptions } from "#/world/maps/indoor-map-types"
import type { InteriorStairRoom, StairLink } from "#/world/town/interior-stair-types"

type Props = Readonly<{ room: InteriorStairRoom; stairs: readonly StairLink[]; incoming: Cell | undefined; options: IndoorMapOptions }>

/** Map collision and stair arrivals consume the same resolved room grid. */
export function createIndoorMap(props: Props): MapDefinition {
  const interior = props.room.interior
  const warps = [...(interior.floor === 0 ? [{ at: interior.door, to: { map: interior.house.map, at: outsideDoor(interior.house).arrive } }] : []), ...props.stairs]
  const spawn = interior.floor === 0 ? interior.arrive : props.incoming
  if (!spawn) throw new Error(`Indoor upper floor has no stair arrival: ${interior.id}`)
  return {
    id: interior.id,
    name: props.options.name(interior),
    kind: "indoor",
    size: INDOOR_SIZE,
    rows: props.room.rows,
    places: {},
    npcs: props.options.npcs(interior),
    warps,
    spawn,
    assets: { sprites: props.options.sprites },
  }
}
