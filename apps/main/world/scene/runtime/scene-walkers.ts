import { createWalkerMovement } from "#/world/scene/runtime/create-walker-movement"
import { WalkerMotion } from "#/world/scene/runtime/walker-motion"
import { WalkerAppearance } from "#/world/scene/runtime/walker-appearance"
import { Figure } from "#/world/scene/figure/figure"
import { wearable } from "#/world/town/wearable"
import { walkH } from "#/world/scene/walk-h"
import { STEP_SPEED } from "#/world/scene/runtime/grid"
import { snap } from "#/world/scene/runtime/snap"
import { center } from "#/world/scene/runtime/center"
import type { Scene } from "three"
import type { Avatar, Cell } from "#/world/scene/runtime/types"
import type { Walker } from "#/world/scene/runtime/walker"
import type { WalkerAction } from "#/world/scene/runtime/walker-motion-types"

type Props = Readonly<{ scene: Scene; onPickPlayer(id: string): void; figureScale: number }>

/** 自分と他プレイヤーの人物・名前を所有し、退出時に表示を一緒に解放する。 */
export class SceneWalkers {
  readonly me: Walker
  readonly movement: ReturnType<typeof createWalkerMovement>
  private readonly entries = new Map<string, Walker>()
  private readonly state: { layer: HTMLElement | null; closed: boolean } = { layer: null, closed: false }
  private readonly appearance: WalkerAppearance<Figure>
  private readonly motion: WalkerMotion

  constructor(private readonly props: Props) {
    this.appearance = new WalkerAppearance({ makeFigure: this.makeFigure })
    this.me = this.createMe()
    const me = this.me
    this.movement = createWalkerMovement(me)
    this.motion = new WalkerMotion({ me, speed: STEP_SPEED, heightAt: walkH })
    Object.freeze(this)
  }

  get remotes(): ReadonlyMap<string, Walker> {
    return this.entries
  }
  get stepWalker(): WalkerMotion["step"] {
    return this.motion.step
  }
  get placeWalker(): WalkerMotion["place"] {
    return this.motion.place
  }
  get action(): WalkerAction | null {
    return this.motion.action
  }
  set action(value: WalkerAction | null) {
    this.motion.action = value
  }
  get layer(): HTMLElement | null {
    return this.state.layer
  }
  set layer(value: HTMLElement | null) {
    this.state.layer = value
  }

  readonly plate = (className: string, text: string): HTMLDivElement => {
    const element = document.createElement("div")
    element.className = className
    element.textContent = text
    this.state.layer?.appendChild(element)
    return element
  }

  readonly setAvatar = (avatar: Avatar): void => {
    this.appearance.update(this.me, avatar)
  }

  readonly addRemote = (id: string, avatar: Avatar, at: Readonly<Cell>): void => {
    if (this.entries.has(id)) {
      this.updateRemote(id, avatar)
      this.moveRemote(id, [at])
      return
    }
    const walker: Walker = {
      id,
      name: avatar.name,
      fig: this.makeFigure(avatar),
      pos: center(at),
      path: [],
      head: Math.random() * Math.PI * 2,
      t: 0,
      label: this.plate("gx-nameplate gx-nameplate--player", avatar.name),
    }
    walker.label.addEventListener("click", (event) => {
      event.stopPropagation()
      this.props.onPickPlayer(id)
    })
    this.appearance.remember(walker, avatar)
    this.entries.set(id, walker)
  }

  readonly updateRemote = (id: string, avatar: Avatar): void => {
    const walker = this.entries.get(id)
    if (walker) this.appearance.update(walker, avatar, "remote")
  }

  readonly removeRemote = (id: string): void => {
    const walker = this.entries.get(id)
    if (!walker) return
    walker.fig.dispose()
    walker.label.remove()
    this.entries.delete(id)
  }

  dispose(): void {
    if (this.state.closed) return
    this.state.closed = true
    try {
      this.me.fig.dispose()
    } finally {
      this.clearRemotes()
    }
  }

  readonly clearRemotes = (): void => {
    for (const id of this.entries.keys()) this.removeRemote(id)
  }

  readonly moveRemote = (id: string, cells: ReadonlyArray<Readonly<Cell>>): void => {
    const walker = this.entries.get(id)
    if (!walker || !cells.length) return
    const points = cells.map(center)
    if (Math.hypot(points[0][0] - walker.pos[0], points[0][1] - walker.pos[1]) > 2) walker.pos = points[0]
    walker.path = points
  }

  private readonly makeFigure = (avatar: Avatar): Figure => {
    const figure = new Figure(wearable(avatar.look), undefined, this.props.figureScale)
    figure.hold(avatar.held)
    this.props.scene.add(figure.root)
    return figure
  }

  private createMe(): Walker {
    return {
      id: "me",
      name: "",
      pos: snap([19.25, 40.25]),
      path: [],
      head: Math.PI,
      t: 0,
      fig: this.makeFigure({ name: "", held: null, look: { top: "cCream", bottom: "cGray", jacket: "cRed", sex: "m", skin: "skin1", hair: "hBrown", style: "curly", eye: "cBlue" } }),
      label: this.plate("gx-nameplate gx-nameplate--me", ""),
    }
  }
}
