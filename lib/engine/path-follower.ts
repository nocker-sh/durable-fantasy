import { advancePathWaypoint } from "#/lib/engine/advance-path-waypoint"
import type { PathAdvance, PathFollowerState } from "#/lib/engine/path-follower-types"

type Props = Readonly<{ speed: number }>

/** Consumes a distance budget across waypoints, independent of render frequency. */
export class PathFollower {
  readonly #props: Props

  constructor(props: Props) {
    this.#props = Object.freeze({ ...props })
    Object.freeze(this)
  }

  advance(state: PathFollowerState, seconds: number): number | null {
    if (!Number.isFinite(seconds) || seconds <= 0) return null

    const progress: PathAdvance = { remaining: this.#props.speed * seconds, consumed: 0, heading: null }
    for (const point of state.path) if (!advancePathWaypoint({ position: state.pos, point, progress })) break
    if (progress.consumed) state.path.splice(0, progress.consumed)
    return progress.heading
  }
}
