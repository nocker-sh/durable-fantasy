import { expect, it } from "vitest"
import { getMapSnapshotModule } from "#/scripts/lib/get-map-snapshot-module"

it("finds the snapshot source in the studio and names it as the studio serves it", () => {
  expect(getMapSnapshotModule()).toBe("/dev/map-snapshot.ts")
})
