import { N, blocked } from "../world"
import { places } from "../build"
import type { Anim } from "../figure"
import { lap } from "../../diagnostics.ts"
import { keyTurn } from "../turn"
import { createSceneRuntime } from "./create.ts"
import type { SceneEvents, ResidentInfo, Cell, WalkerInfo, Avatar } from "./types.ts"
import { cellOf } from "./grid.ts"

type SceneRuntime = Awaited<ReturnType<typeof createSceneRuntime>>

export class MapScene {
  private alive = true
  private ro?: ResizeObserver
  private runtime?: SceneRuntime
  private layer = document.createElement("div")

  constructor(
    private el: HTMLElement,
    private ev: SceneEvents,
    readonly map = "phanthiet",
  ) {
    if (getComputedStyle(el).position === "static") el.style.position = "relative"
    el.style.overflow = "hidden"
    Object.assign(this.layer.style, { position: "absolute", inset: "0", pointerEvents: "none", overflow: "hidden" })
    createSceneRuntime(map, (t) => this.ev.progress(t)).then(
      (runtime) => {
        if (this.alive) this.attach(runtime)
        else runtime.dispose()
      },
      (error) => this.ev.failed?.(error),
    )
  }

  destroy() {
    this.alive = false
    this.ro?.disconnect()
    if (this.runtime) {
      this.runtime.running = false
      this.runtime.renderer.domElement.remove()
      this.runtime.events = null
      this.runtime.clearRemotes()
      this.runtime.dispose()
    }
    this.layer.remove()
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
    return this.runtime?.people.flatMap((a, i) => (a.fig.root.visible ? [{ id: this.runtime!.ids[i], name: a.name, job: a.job, x: a.pos[0], z: a.pos[1] }] : [])) ?? []
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
    return Object.fromEntries(Object.entries(places).map(([k, [x, z]]) => [k, [Math.floor(x * 2), Math.floor(z * 2)]]))
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
  struck(id: string, kind: "miss" | "hit" | "critical", damage: number, hp: number, back: number) {
    this.runtime?.struck(id, kind, damage, hp, back)
  }
  /** A blow taken by the player ('me') or someone else on the map: the number floats up from them. */
  hurt(who: string, kind: "miss" | "hit" | "critical", damage: number) {
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
    this.runtime = runtime
    runtime.events = this.ev
    this.el.appendChild(runtime.renderer.domElement)
    this.el.appendChild(this.layer)
    runtime.setLayer(this.layer)
    const resize = () => runtime.resize(this.el.clientWidth, this.el.clientHeight)
    this.ro = new ResizeObserver(resize)
    this.ro.observe(this.el)
    resize()
    runtime.running = true
    runtime.start()
    lap("scene: attached")
    this.ev.ready()
  }
}
