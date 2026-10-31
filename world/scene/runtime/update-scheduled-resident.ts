import type { Actor } from "#/world/scene/actor"
import type { ActivityPose } from "#/world/town/activity-pose"
import type { V2 } from "#/world/scene/construction/registry"

type Props = Readonly<{ actor: Pick<Actor, "pos" | "seat" | "anim" | "faceTo"> & { fig: { root: { visible: boolean } } }; position: V2 | null; pose: ActivityPose | null; centre: V2 }>

/** 会話中の向きを保ち、席を離れるときだけ座った動作を解除する。 */
export function updateScheduledResident(props: Props): void {
  const actor = props.actor
  actor.fig.root.visible = !!props.position
  const previousSeat = actor.seat
  actor.seat = props.pose?.seat ?? null
  if (previousSeat && !actor.seat) actor.anim = "idle"
  const moved = props.position && (props.position[0] !== actor.pos[0] || props.position[1] !== actor.pos[1])
  if (moved && props.position) actor.pos = [props.position[0], props.position[1]]
  const facing = props.pose?.facing
  if (facing) actor.faceTo(facing)
  else if (moved) actor.faceTo(props.centre)
}
