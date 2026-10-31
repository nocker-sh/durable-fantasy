import { getGroundHit } from "#/lib/graphics/get-ground-hit"
import { pickVisibleOwner } from "#/lib/graphics/pick-visible-owner"
import { Raycaster, Vector2 } from "three"
import type * as THREE from "three"
import { walkH } from "#/world/scene/walk-h"
import { isFree } from "#/world/scene/is-free"
import type { V2 } from "#/world/scene/construction/registry"
import type { Actor } from "#/world/scene/actor"
import { critters } from "#/world/scene/critters"
import { dragTurn } from "#/world/scene/drag-turn"
import type { Walker } from "#/world/scene/runtime/walker"
import { snap } from "#/world/scene/runtime/snap"
type Props = Readonly<{
  renderer: {
    domElement: EventTarget &
      Pick<HTMLCanvasElement, "addEventListener" | "removeEventListener"> & {
        style: { cursor: string }
        getBoundingClientRect(): Pick<DOMRect, "left" | "top" | "width" | "height">
      }
  }
  cam: THREE.Camera
  terrain: THREE.Object3D
  town: THREE.Group
  people: ReadonlyArray<Actor>
  ids: ReadonlyArray<number>
  remotes: ReadonlyMap<string, Walker>
  cursor: THREE.LineSegments
  movement: { yawTarget: number }
  spotHit(ray: THREE.Raycaster): string | null
  monsterHit(ray: THREE.Raycaster): string | null
  approach(id: number): void
  approachSpot(id: string): void
  fight(id: string): void
  walkTo(at: V2): void
  zoom(delta: number): void
  clearFight(): void
}>

type PointerState = {
  hovered: Actor | null
  hoveredWalker: Walker | null
  hoveredMonster: string | null
  hoveredCritter: (typeof critters)[number] | null
  drag: { id: number; x: number; moved: boolean } | null
  pending: PointerEvent | null
  wheelAt: number
  closed: boolean
}

/** 一つのポインターがドラッグを所有し、ホバーを描画ごとにまとめ、クリックは直ちに通知する。 */
export class ScenePointer {
  private readonly ray = new Raycaster()
  private readonly ndc = new Vector2()
  private readonly events = window
  private readonly state: PointerState = { hovered: null, hoveredWalker: null, hoveredMonster: null, hoveredCritter: null, drag: null, pending: null, wheelAt: 0, closed: false }

  constructor(private readonly props: Props) {
    props.renderer.domElement.addEventListener("pointerdown", this.onDown)
    this.events.addEventListener("pointermove", this.onMove)
    this.events.addEventListener("pointerup", this.onUp)
    this.events.addEventListener("pointercancel", this.onCancel)
    this.events.addEventListener("blur", this.cancel)
    props.renderer.domElement.addEventListener("wheel", this.onWheel, { passive: false })
    Object.freeze(this)
  }

  get hovered(): Actor | null {
    return this.state.hovered
  }
  get hoveredWalker(): Walker | null {
    return this.state.hoveredWalker
  }
  get hoveredMonster(): string | null {
    return this.state.hoveredMonster
  }
  get hoveredCritter(): (typeof critters)[number] | null {
    return this.state.hoveredCritter
  }

  readonly update = (): void => {
    const event = this.state.pending
    this.state.pending = null
    if (!event) return
    this.setNdc(event)
    this.updateHover()
    const overSpot = !this.state.hovered && (this.props.spotHit(this.ray) || this.state.hoveredMonster)
    const ground = this.state.hovered || overSpot ? null : this.groundHit()
    this.props.renderer.domElement.style.cursor = this.state.hovered || overSpot ? "pointer" : "default"
    this.showGroundCursor(ground)
  }

  dispose(): void {
    if (this.state.closed) return
    this.state.closed = true
    this.cancel()
    this.props.renderer.domElement.removeEventListener("pointerdown", this.onDown)
    this.props.renderer.domElement.removeEventListener("wheel", this.onWheel)
    this.events.removeEventListener("pointermove", this.onMove)
    this.events.removeEventListener("pointerup", this.onUp)
    this.events.removeEventListener("pointercancel", this.onCancel)
    this.events.removeEventListener("blur", this.cancel)
  }

  private setNdc(event: PointerEvent): void {
    const bounds = this.props.renderer.domElement.getBoundingClientRect()
    this.ndc.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1)
    this.ray.setFromCamera(this.ndc, this.props.cam)
  }

  private groundHit(): V2 | null {
    return getGroundHit({ ray: this.ray, terrain: this.props.terrain, structures: this.props.town, isFree })
  }

  private residentHit(): Actor | null {
    return pickVisibleOwner({ ray: this.ray, owners: this.props.people, root: (person) => person.fig.root })
  }

  private updateHover(): void {
    const state = this.state
    state.hovered = this.residentHit()
    state.hoveredWalker = state.hovered ? null : pickVisibleOwner({ ray: this.ray, owners: [...this.props.remotes.values()], root: (walker) => walker.fig.root })
    state.hoveredMonster = state.hovered || state.hoveredWalker ? null : this.props.monsterHit(this.ray)
    state.hoveredCritter = state.hovered || state.hoveredWalker || state.hoveredMonster ? null : pickVisibleOwner({ ray: this.ray, owners: critters, root: (critter) => critter.obj })
  }

  private showGroundCursor(ground: V2 | null): void {
    const cursor = this.props.cursor
    if (!ground || !isFree(ground[0], ground[1])) {
      cursor.visible = false
      return
    }
    const cell = snap(ground)
    cursor.position.set(cell[0], walkH(cell[0], cell[1]) + 0.03, cell[1])
    cursor.visible = true
  }

  private clearHover(): void {
    this.state.pending = null
    this.props.cursor.visible = false
    this.state.hovered = null
    this.state.hoveredWalker = null
    this.state.hoveredMonster = null
    this.state.hoveredCritter = null
    this.props.renderer.domElement.style.cursor = "default"
  }

  private readonly cancel = (): void => {
    this.state.drag = null
    this.clearHover()
  }

  private readonly onDown = (event: PointerEvent): void => {
    if (event.button === 0 && !this.state.drag) this.state.drag = { id: event.pointerId, x: event.clientX, moved: false }
  }

  private readonly onCancel = (event: PointerEvent): void => {
    if (!this.state.drag || this.state.drag.id === event.pointerId) this.cancel()
  }

  private readonly onMove = (event: PointerEvent): void => {
    if (this.state.drag && this.state.drag.id !== event.pointerId) return
    if (this.state.drag && event.pointerType === "mouse" && !(event.buttons & 1)) this.cancel()
    this.moveDrag(event.clientX)
    this.state.pending = null
    if (event.target !== this.props.renderer.domElement) {
      this.clearHover()
      return
    }
    this.state.pending = event
  }

  private moveDrag(x: number): void {
    const drag = this.state.drag
    if (!drag) return
    const delta = x - drag.x
    if (Math.abs(delta) > 6) drag.moved = true
    const turn = dragTurn(delta)
    if (!drag.moved || !turn) return
    this.props.movement.yawTarget += turn
    drag.x = x
  }

  private readonly onUp = (event: PointerEvent): void => {
    if (this.state.drag && this.state.drag.id !== event.pointerId) return
    const drag = this.state.drag
    this.state.drag = null
    if (!drag || drag.moved || event.target !== this.props.renderer.domElement) return
    this.setNdc(event)
    this.pickAtPointer()
  }

  private pickAtPointer(): void {
    const resident = this.residentHit()
    if (resident) return this.props.approach(this.props.ids[this.props.people.indexOf(resident)])
    const spot = this.props.spotHit(this.ray)
    if (spot) return this.props.approachSpot(spot)
    const monster = this.props.monsterHit(this.ray)
    if (monster) return this.props.fight(monster)
    this.props.clearFight()
    const ground = this.groundHit()
    if (ground) this.props.walkTo(ground)
  }

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault()
    const now = performance.now()
    if (now - this.state.wheelAt < 180) return
    this.state.wheelAt = now
    this.props.zoom(-Math.sign(event.deltaY))
  }
}
