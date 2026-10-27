import { expect, it } from "vitest"
import { PathFollower } from "../../../lib/engine/path-follower"
import { cellsReached, type Cell } from "../../protocol"
import { cellOf, center, STEP_SPEED } from "./grid"

it.each([5, 10, 30, 60])("keeps a long walk inside the server's position window at %s fps", (fps) => {
  const route: Cell[] = Array.from({ length: 70 }, (_, i) => [10 + i, 10 + Math.min(i, 20)])
  const state = { pos: center(route[0]), path: route.slice(1).map(center) }
  const follower = new PathFollower(STEP_SPEED)
  for (let frame = 1; frame <= fps * 10; frame++) {
    follower.advance(state, 1 / fps)
    expect(cellsReached(route, frame / fps)).toContainEqual(cellOf(state.pos))
  }
})
