import type { V2 } from "#/world/scene/construction/registry"
import type { Walker } from "#/world/scene/runtime/walker"

type Resident = { pos: V2; faceTo(position: V2): void }
type Props<T extends Resident> = Readonly<{
  me: Pick<Walker, "pos" | "head">
  marker: { visible: boolean }
  personOf(id: number): T | undefined
  idOf(person: T): number | null
  onReach(id: number): void
}>

/** 到着の通知より先に住民とプレイヤーを向き合わせ、登録された住民の番号だけを返す。 */
export class SceneResidentConversation<T extends Resident> {
  constructor(private readonly props: Props<T>) {
    Object.freeze(this)
  }

  readonly reach = (person: T): void => {
    this.props.marker.visible = false
    const id = this.props.idOf(person)
    if (id === null) return
    this.faceResident(id)
    this.props.onReach(id)
  }

  readonly faceResident = (id: number): void => {
    const person = this.props.personOf(id)
    if (!person) return
    person.faceTo(this.props.me.pos)
    this.props.me.head = Math.atan2(person.pos[0] - this.props.me.pos[0], person.pos[1] - this.props.me.pos[1])
  }
}
