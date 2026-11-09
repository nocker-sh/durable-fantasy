import { expect, it } from "vitest"
import { getSeatedContacts } from "#/world/scene/get-seated-contacts"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"

const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ヴィルヘルム")]
it.each([Math.PI / 2, Math.PI, -Math.PI / 2])("rotates grounded native contacts about the seat, including the clip's root offset: %s", (heading) => {
  const place = { at: [3, 4] satisfies [number, number], height: 0.358, heading: 0 }
  const front = getSeatedContacts({ look, place, frame: 0 })
  const turned = getSeatedContacts({ look, place: { ...place, heading }, frame: 0 })
  if (front instanceof Error) throw front
  if (turned instanceof Error) throw turned

  for (const index of [0, 1]) {
    const point = front.shoes[index].b,
      rotated = turned.shoes[index].b
    expect(rotated[0] - 3).toBeCloseTo((point[0] - 3) * Math.cos(heading) + (point[2] - 4) * Math.sin(heading), 12)
    expect(rotated[2] - 4).toBeCloseTo(-(point[0] - 3) * Math.sin(heading) + (point[2] - 4) * Math.cos(heading), 12)
    expect(rotated[1]).toBe(point[1])
    expect(turned.shoes[index].radius).toBe(front.shoes[index].radius)
  }
})
