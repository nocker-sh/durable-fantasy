import { getEnvelopeWindowProjection } from "#/scripts/lib/get-envelope-window-projection"
import type { EnvelopeWindowSource } from "#/scripts/lib/envelope-window-types"
import type { FramedWindow } from "#/world/town/room-fixtures"

/** World positions include the foundation; the legacy window sill stays relative to that same foundation. */
export function compileEnvelopeWindow(props: EnvelopeWindowSource): FramedWindow {
  const projection = getEnvelopeWindowProjection(props),
    window = props.window
  const fixture: FramedWindow = {
    floor: window.floor,
    id: window.id,
    point: [projection.point[0], projection.point[2]],
    outward: [projection.outward[0], projection.outward[2]],
    width: window.width / props.metresPerTile,
    height: window.height / props.metresPerTile,
    sill: projection.sill,
    frame: window.frame / props.metresPerTile,
    depth: props.wallMetres / props.metresPerTile,
  }
  if (![...projection.point, fixture.width, fixture.height, fixture.frame, fixture.depth].every(Number.isFinite)) throw new Error(`Window ${window.id} has an unbounded position`)
  return fixture
}
