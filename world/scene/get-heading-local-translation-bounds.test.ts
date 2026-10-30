import { expect, it } from "vitest"
import { getHeadingLocalTranslationBounds } from "#/world/scene/get-heading-local-translation-bounds"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"

it("encloses every intermediate obstacle corner over the full fixed-heading root translation", () => {
  for (const heading of [0, Math.PI / 4, Math.PI / 2]) {
    const props = { box: { x0: 2, x1: 2.5, z0: 4, z1: 5, bottom: 0, top: 1.2 }, from: [1.6, 0.1, 3.9], to: [1.6, 0.1, 4.4], heading } satisfies Parameters<typeof getHeadingLocalTranslationBounds>[0]
    const bounds = getHeadingLocalTranslationBounds(props)
    if (bounds instanceof Error) throw bounds
    for (const t of [0, 0.25, 0.5, 0.75, 1])
      for (const x of [props.box.x0, props.box.x1])
        for (const y of [props.box.bottom, props.box.top])
          for (const z of [props.box.z0, props.box.z1]) {
            const point = toHeadingLocalPoint([x, y, z], [1.6, 0.1, 3.9 + 0.5 * t], heading)
            expect(point[0]).toBeGreaterThanOrEqual(bounds.x0)
            expect(point[0]).toBeLessThanOrEqual(bounds.x1)
            expect(point[1]).toBeGreaterThanOrEqual(bounds.bottom)
            expect(point[1]).toBeLessThanOrEqual(bounds.top)
            expect(point[2]).toBeGreaterThanOrEqual(bounds.z0)
            expect(point[2]).toBeLessThanOrEqual(bounds.z1)
          }
    expect(getHeadingLocalTranslationBounds({ ...props, heading: NaN })).toBeInstanceOf(Error)
  }
})
