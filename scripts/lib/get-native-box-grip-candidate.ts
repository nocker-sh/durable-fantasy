import { solveHeldBoxPose } from "#/world/scene/figure/solve-held-box-pose"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import type { AshReceiving } from "#/scripts/lib/ash-receiving-schema"
type Props = Omit<Parameters<typeof solveHeldBoxPose>[0], "skeleton" | "candidate"> & { candidate: AshReceiving["grip_candidate"] }
/** Standing reach remains the baseline; solving a walking posture must be requested explicitly. */
export function getNativeBoxGripCandidate(props: Props) {
  return solveHeldBoxPose({ ...props, skeleton: skelFor(props.look, "idle", 0) })
}
