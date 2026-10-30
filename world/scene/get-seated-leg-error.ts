import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import type { getSeatedContacts } from "#/world/scene/get-seated-contacts"
import type { WorkTableSection } from "#/world/town/work-table"
type Contacts = Exclude<ReturnType<typeof getSeatedContacts>, Error>
type Props = { contacts: Contacts; table: readonly WorkTableSection[]; floor: number }

/** Check shoe support and native shoe/knee envelopes; transitions and the skirt or upper body are separate. */
export function getSeatedLegError(props: Props): Error | null {
  if (!Number.isFinite(props.floor) || !props.table.length) return new Error("Invalid seated support plane or table")
  if (props.contacts.shoes.length !== 2 || props.contacts.knees.length !== 2) return new Error("Incomplete native seated leg contacts")
  const boxes = props.table.map((section) => ({ x0: section.x0, x1: section.x1, z0: section.z0, z1: section.z1, bottom: section.y0, top: section.y1 }))
  if (boxes.some((box) => !Object.values(box).every(Number.isFinite) || box.x0 >= box.x1 || box.z0 >= box.z1 || box.bottom >= box.top)) return new Error("Invalid seated table section")
  const shoes = props.contacts.shoes.map((shoe) => ({ ...shoe, kind: "shoe" }))
  const knees = props.contacts.knees.map((knee) => ({ a: knee.center, b: knee.center, radius: knee.radius, kind: "knee" }))
  const parts = [...shoes, ...knees]
  if (parts.some((part) => ![...part.a, ...part.b, part.radius].every(Number.isFinite) || part.radius <= 0)) return new Error("Invalid native seated leg geometry")
  if (shoes.some((shoe) => Math.abs(Math.min(shoe.a[1], shoe.b[1]) - shoe.radius - props.floor) >= 0.002)) return new Error("Seated shoe does not meet its support plane")
  for (const part of parts)
    for (const box of boxes) {
      if (segmentCuboidDistance(box, part.a, part.b) <= part.radius) return new Error(`Seated ${part.kind} intersects the table`)
    }

  return null
}
