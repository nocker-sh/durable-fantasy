import { NAME_RANGE } from "#/world/scene/runtime/grid"
import type { V2 } from "#/world/scene/construction/registry"

type Resident = { name: string; pos: V2; fig: { root: { visible: boolean } } }
type Nameplate = { classList: { add(name: string): void; remove(name: string): void } }
type Props<T, E> = Readonly<{
  people: readonly T[]
  me: { pos: V2 }
  create(name: string): E
  place(person: T, element: E, visible: boolean): void
}>

/** 住民と名札の対応を保持し、近さと指している人物から表示を決める。 */
export class SceneResidentNames<T extends Resident, E extends Nameplate> {
  private readonly entries: ReadonlyArray<{ person: T; element: E }>
  private readonly state: { hovered: E | null } = { hovered: null }

  constructor(private readonly props: Props<T, E>) {
    this.entries = props.people.map((person) => ({ person, element: props.create(person.name) }))
    Object.freeze(this)
  }

  get elements(): E[] {
    return this.entries.map((entry) => entry.element)
  }

  readonly update = (hovered: T | null): void => {
    this.updateHover(hovered)
    for (const entry of this.entries) {
      const person = entry.person
      const near = Math.hypot(person.pos[0] - this.props.me.pos[0], person.pos[1] - this.props.me.pos[1]) < NAME_RANGE || person === hovered
      this.props.place(person, entry.element, person.fig.root.visible && near)
    }
  }

  private updateHover(person: T | null): void {
    const next = person ? (this.entries.find((entry) => entry.person === person)?.element ?? null) : null
    if (next === this.state.hovered) return
    this.state.hovered?.classList.remove("gx-nameplate--hover")
    next?.classList.add("gx-nameplate--hover")
    this.state.hovered = next
  }
}
