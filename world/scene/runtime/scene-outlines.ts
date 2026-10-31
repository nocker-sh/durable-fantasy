import { outlineShape } from "#/lib/graphics/outline-shape"
import type { Figure } from "#/world/scene/figure/figure"
import type { MonsterView } from "#/world/scene/monsters"
import type { Critter } from "#/world/scene/animal-types"

type Person = { fig: Pick<Figure, "outline"> }
type Animal = Pick<Critter, "outline">
type Props = Readonly<{
  me: { fig: Pick<Figure, "xray" | "outline"> }
  people: ReadonlyArray<Person>
  remotes: ReadonlyMap<string, Person>
  monsters: ReadonlyArray<Pick<MonsterView, "body" | "spawn">>
  critters: ReadonlyArray<Animal>
  pointer: { readonly hovered: Person | null; readonly hoveredWalker: Person | null; readonly hoveredMonster: string | null; readonly hoveredCritter: Animal | null }
  preview: boolean
}>

/** 自分の輪郭と遮蔽物越しの表示を保ち、他の人物と生き物は指された対象だけを囲む。 */
export class SceneOutlines {
  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  readonly update = (hidden: boolean): void => {
    if (!this.props.preview) {
      this.props.me.fig.xray(hidden)
      this.props.me.fig.outline(true, hidden)
    }
    for (const person of this.props.people) person.fig.outline(person === this.props.pointer.hovered)
    for (const walker of this.props.remotes.values()) walker.fig.outline(walker === this.props.pointer.hoveredWalker)
    for (const monster of this.props.monsters) outlineShape(monster.body, monster.spawn.id === this.props.pointer.hoveredMonster)
    for (const critter of this.props.critters) critter.outline(critter === this.props.pointer.hoveredCritter)
  }
}
