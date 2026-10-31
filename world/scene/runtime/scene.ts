import { releaseSceneAttachment } from "#/world/scene/runtime/release-scene-attachment"
import type { SceneRuntime } from "#/world/scene/runtime/scene-runtime-types"
import type { HitKind, MonsterStrike } from "#/world/scene/runtime/combat-feedback-types"
import { blocked } from "#/world/scene/world"
import { N } from "#/world/maps/ground/rules"
import { places } from "#/world/scene/construction/registry"
import type { Anim } from "#/world/scene/figure/animation"
import { lap } from "#/world/lap"
import { keyTurn } from "#/world/scene/key-turn"
import { createSceneRuntime } from "#/world/scene/runtime/create-scene-runtime"
import type { SceneOptions } from "#/world/scene/runtime/scene-options"
import type { SceneEvents, ResidentInfo, Cell, WalkerInfo, Avatar } from "#/world/scene/runtime/types"
import { cellOf } from "#/world/scene/runtime/cell-of"

type Props = { element: HTMLElement; events: SceneEvents; map?: string; options?: SceneOptions }

export class MapScene {
  private readonly state: { alive: boolean; runtime: SceneRuntime | null; observer: ResizeObserver | null } = { alive: true, runtime: null, observer: null }
  private readonly construction = new AbortController()
  private readonly layer = document.createElement("div")
  private readonly options: SceneOptions
  readonly map: string

  constructor(private readonly props: Props) {
    this.map = props.map ?? "phanthiet"
    this.options = props.options ?? {}
    this.prepareElement()
    this.load()
    Object.freeze(this)
  }

  private prepareElement(): void {
    if (getComputedStyle(this.props.element).position === "static") this.props.element.style.position = "relative"
    this.props.element.style.overflow = "hidden"
    Object.assign(this.layer.style, { position: "absolute", inset: "0", pointerEvents: "none", overflow: "hidden" })
  }

  private load(): void {
    createSceneRuntime(
      this.map,
      (text) => {
        if (this.state.alive) this.props.events.progress(text)
      },
      { signal: this.construction.signal, options: this.options },
    ).then(
      (runtime) => this.accept(runtime),
      (error) => this.failed(error),
    )
  }

  private accept(runtime: SceneRuntime): void {
    if (!this.state.alive) {
      runtime.dispose()
      return
    }
    try {
      this.attach(runtime)
    } catch (error) {
      try {
        this.release()
      } catch (cleanupError) {
        this.failed(new AggregateError([error, cleanupError], "Scene attachment and cleanup failed"))
        return
      }
      this.failed(error)
    }
  }

  private failed(error: unknown): void {
    if (this.state.alive) this.props.events.failed?.(error)
  }

  private release(): void {
    const runtime = this.runtime
    const observer = this.state.observer
    this.state.runtime = null
    this.state.observer = null
    releaseSceneAttachment({ runtime, observer, layer: this.layer })
  }

  destroy(): void {
    this.state.alive = false
    this.construction.abort()
    this.release()
  }

  private get runtime(): SceneRuntime | null {
    return this.state.runtime
  }

  get ready() {
    return !!this.runtime
  }
  /** Size of the map in world units (it is square). */
  get size() {
    return N
  }
  /** The ground painting, for a minimap. */
  groundImage(): HTMLCanvasElement | null {
    return this.runtime?.groundCanvas ?? null
  }
  /** Residents on this map; id is their index in RESIDENTS. */
  residents(): ResidentInfo[] {
    const runtime = this.runtime
    return runtime?.people.flatMap((person, index) => (person.fig.root.visible ? [{ id: runtime.ids[index], name: person.name, job: person.job, x: person.pos[0], z: person.pos[1] }] : [])) ?? []
  }
  /** Where the player is; heading is the facing in radians (0 = south, +x = east). */
  player(): { x: number; z: number; walking: boolean; heading: number } | null {
    return this.runtime ? { x: this.runtime.movement.pos[0], z: this.runtime.movement.pos[1], walking: this.runtime.movement.path.length > 0, heading: this.runtime.heading() } : null
  }
  /** Frames drawn per second, averaged over the last second. */
  fps(): number {
    return this.runtime?.fps() ?? 0
  }
  /** How many window glows and lamps there are and how many are lit. */
  lights() {
    return this.runtime?.lights() ?? null
  }
  playerCell(): Cell | null {
    return this.runtime ? cellOf(this.runtime.movement.pos) : null
  }
  remotes(): WalkerInfo[] {
    return this.runtime ? [...this.runtime.remotes.values()].map((w) => ({ id: w.id, name: w.name, x: w.pos[0], z: w.pos[1], walking: w.path.length > 0 })) : []
  }

  walkTo(x: number, z: number) {
    this.runtime?.walkTo([x, z])
  }
  /** Walk on, a cell at a time, the way the keys point on screen (null: let go). */
  hold(dir: [number, number] | null) {
    this.runtime?.hold(dir)
  }
  approach(id: number) {
    this.runtime?.approach(id)
  }
  stop() {
    this.runtime?.stop()
  }
  stopFight(id: string) {
    this.runtime?.stopFight(id)
  }
  /** The walk grid as built (1 = blocked), for scripts/export-map.ts. */
  walkGrid(): Uint8Array {
    return blocked.slice()
  }
  /** The named spots on this map (where residents stand), in cells. */
  places(): Record<string, [number, number]> {
    return Object.fromEntries(
      Object.entries(places).map((entry) => {
        const k = entry[0]
        const nestedValue = entry[1]
        const x = nestedValue[0]
        const z = nestedValue[1]
        return [k, [Math.floor(x * 2), Math.floor(z * 2)]]
      }),
    )
  }
  /** Mark the warp cells on the ground. */
  setWarps(cells: readonly (readonly [number, number])[]) {
    this.runtime?.setWarps(cells)
  }
  /** While frozen (talking to an NPC, shopping) clicks do not move the player. */
  freeze(frozen: boolean) {
    this.runtime?.freeze(frozen)
  }
  /** A speech bubble over the player ('me') or another player (their id). */
  bubble(who: string, text: string) {
    this.runtime?.bubble(who, text)
  }
  /** Put the player on a cell (if it is walkable), e.g. where they appear in town. */
  placePlayer(at: Cell) {
    this.runtime?.placePlayer(at)
  }
  /** Turn the view in 45° steps (Q and the left button send +1). */
  rotate(steps: number) {
    if (this.runtime) this.runtime.movement.yawTarget += keyTurn(steps)
  }
  zoom(delta: number) {
    this.runtime?.zoom(delta)
  }
  /** Where the zoom is: 0 is furthest out. */
  zoomLevel(): { level: number; max: number } {
    return this.runtime ? this.runtime.zoomLevel() : { level: 1, max: 1 }
  }
  setTimeOfDay(k: number) {
    this.runtime?.setTod(k)
  }
  /** Minutes since midnight (Japan time) to light the scene by. */
  setClock(min: number) {
    this.runtime?.setClock(min)
  }
  /** How much each gathering spot has left: spent ones show bare. */
  setNodes(left: Readonly<Record<string, number>>) {
    this.runtime?.setNodes(left)
  }
  /** What the server says of the creatures here, and of a blow struck. */
  setWild(states: Readonly<Record<string, { hp: number; back: number }>>) {
    this.runtime?.setWild(states)
  }
  struck(input: MonsterStrike) {
    this.runtime?.struck(input)
  }
  /** A blow taken by the player ('me') or someone else on the map: the number floats up from them. */
  hurt(who: string, kind: HitKind, damage: number) {
    this.runtime?.hurt(who, kind, damage)
  }
  /** Fallen: the player slumps where they are and cannot move until they come to. */
  setDown(down: boolean) {
    this.runtime?.setDown(down)
  }
  /** Sitting down to rest (core/skills.ts): the player sits where they are until they walk off. */
  setSitting(on: boolean) {
    this.runtime?.setSitting(on)
  }
  setAttackDelay(ms: number) {
    this.runtime?.setAttackDelay(ms)
  }
  /** Go after a creature and keep striking it (as clicking it does). */
  fight(id: string) {
    this.runtime?.fight(id)
  }
  /** The player chops, picks or fishes for a moment, facing the spot. */
  playAction(anim: Anim, cell: readonly [number, number]) {
    this.runtime?.playAction(anim, cell)
  }
  /** Turn the player and a resident to face each other. */
  faceResident(id: number) {
    this.runtime?.faceResident(id)
  }

  setAvatar(a: Avatar) {
    this.runtime?.setAvatar(a)
  }

  addRemote(id: string, a: Avatar, at: Cell) {
    this.runtime?.addRemote(id, a, at)
  }
  updateRemote(id: string, a: Avatar) {
    this.runtime?.updateRemote(id, a)
  }
  removeRemote(id: string) {
    this.runtime?.removeRemote(id)
  }
  moveRemote(id: string, path: Cell[]) {
    this.runtime?.moveRemote(id, path)
  }
  clearRemotes() {
    this.runtime?.clearRemotes()
  }

  private attach(runtime: SceneRuntime) {
    this.state.runtime = runtime
    runtime.events = this.props.events
    this.props.element.appendChild(runtime.renderer.domElement)
    // the preview shows the town alone: no names or bubbles over it
    if (!this.options.preview) {
      this.props.element.appendChild(this.layer)
      runtime.setLayer(this.layer)
    }
    const resize = () => runtime.resize(this.props.element.clientWidth, this.props.element.clientHeight)
    this.state.observer = new ResizeObserver(resize)
    this.state.observer.observe(this.props.element)
    resize()
    runtime.running = true
    runtime.start()
    lap("scene: attached")
    this.props.events.ready()
  }
}
