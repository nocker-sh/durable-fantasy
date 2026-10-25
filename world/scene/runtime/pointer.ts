import * as THREE from "three"
import { walkH, isFree } from "../world"
import type { V2 } from "../build"
import { type Actor, critters } from "../actors"
import { dragTurn } from "../turn"
import type { Walker } from "./walker.ts"
import { snap } from "./grid.ts"
interface PointerScene {
  renderer: THREE.WebGLRenderer
  cam: THREE.Camera
  terrain: THREE.Object3D
  town: THREE.Group
  people: Actor[]
  ids: number[]
  remotes: Map<string, Walker>
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
}
export function createPointer({ renderer, cam, terrain, town, people, ids, remotes, cursor, movement, spotHit, monsterHit, approach, approachSpot, fight, walkTo, zoom, clearFight }: PointerScene) {
  // ---------------------------------------------------------------- input (pointer only; keys belong to the Game)
  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const setNdc = (e: PointerEvent) => {
    const r = renderer.domElement.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, cam)
  }
  /**
   * Where a click lands on the ground. The ground comes first: a roof or wall standing in front of
   * free ground does not catch the click, so the street behind a house can be clicked. Only where
   * the ground under the ray is not free (water under a bridge, a step) does the town's own surface count.
   */
  const groundHit = (): V2 | null => {
    const th = ray.intersectObject(terrain)[0]
    if (th && isFree(th.point.x, th.point.z)) return [th.point.x, th.point.z]
    const bh = ray.intersectObject(town, true).find((h) => isFree(h.point.x, h.point.z))
    const hit = bh ?? th
    return hit ? [hit.point.x, hit.point.z] : null
  }
  const residentHit = (): Actor | null => {
    const hits = ray.intersectObjects(
      people.filter((p) => p.fig.root.visible).map((p) => p.fig.root),
      true,
    )
    let o: THREE.Object3D | null = hits[0]?.object ?? null
    while (o && !o.userData.actor) o = o.parent
    return (o?.userData.actor as Actor | undefined) ?? null
  }
  let hovered: Actor | null = null
  // what else the pointer is on, for the white outline: another player, a creature, an animal
  let hoveredWalker: Walker | null = null,
    hoveredMonster: string | null = null,
    hoveredCritter: (typeof critters)[number] | null = null
  const walkerHit = (): Walker | null => {
    const ws = [...remotes.values()].filter((w) => w.fig.root.visible)
    const hits = ray.intersectObjects(
      ws.map((w) => w.fig.root),
      true,
    )
    let o: THREE.Object3D | null = hits[0]?.object ?? null
    while (o && !ws.some((w) => w.fig.root === o)) o = o.parent
    return ws.find((w) => w.fig.root === o) ?? null
  }
  const critterHit = () => {
    const hits = ray.intersectObjects(
      critters.map((c) => c.obj).filter((o) => o.visible),
      true,
    )
    let o: THREE.Object3D | null = hits[0]?.object ?? null
    while (o && !critters.some((c) => c.obj === o)) o = o.parent
    return critters.find((c) => c.obj === o) ?? null
  }
  let drag: { x: number; moved: boolean } | null = null
  const onDown = (e: PointerEvent) => {
    if (e.button === 0) drag = { x: e.clientX, moved: false }
  }
  const onMove = (e: PointerEvent) => {
    if (drag) {
      const dx = e.clientX - drag.x
      if (Math.abs(dx) > 6) drag.moved = true
      // dragging turns the view in the same 45° steps as the keys, one step per 90px
      if (drag.moved && dragTurn(dx)) {
        movement.yawTarget += dragTurn(dx)
        drag.x = e.clientX
      }
    }
    if (e.target !== renderer.domElement) {
      cursor.visible = false
      hovered = null
      hoveredWalker = null
      hoveredMonster = null
      hoveredCritter = null
      return
    }
    setNdc(e)
    hovered = residentHit()
    hoveredWalker = hovered ? null : walkerHit()
    hoveredMonster = hovered || hoveredWalker ? null : monsterHit(ray)
    hoveredCritter = hovered || hoveredWalker || hoveredMonster ? null : critterHit()
    const overSpot = !hovered && (spotHit(ray) || hoveredMonster)
    const g = hovered || overSpot ? null : groundHit()
    renderer.domElement.style.cursor = hovered || overSpot ? "pointer" : "default"
    if (g && isFree(g[0], g[1])) {
      const c = snap(g)
      cursor.position.set(c[0], walkH(c[0], c[1]) + 0.03, c[1])
      cursor.visible = true
    } else cursor.visible = false
  }
  const onUp = (e: PointerEvent) => {
    const d = drag
    drag = null
    if (!d || d.moved || e.target !== renderer.domElement) return
    setNdc(e)
    const a = residentHit()
    if (a) {
      approach(ids[people.indexOf(a)])
      return
    }
    const spot = spotHit(ray)
    if (spot) {
      approachSpot(spot)
      return
    }
    const mon = monsterHit(ray)
    if (mon) {
      fight(mon)
      return
    }
    clearFight()
    const g = groundHit()
    if (g) walkTo(g)
  }
  let wheelAt = 0
  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const now = performance.now()
    if (now - wheelAt < 180) return
    wheelAt = now
    zoom(-Math.sign(e.deltaY))
  }
  renderer.domElement.addEventListener("pointerdown", onDown)
  window.addEventListener("pointermove", onMove)
  window.addEventListener("pointerup", onUp)
  renderer.domElement.addEventListener("wheel", onWheel, { passive: false })

  return {
    get hovered() {
      return hovered
    },
    get hoveredWalker() {
      return hoveredWalker
    },
    get hoveredMonster() {
      return hoveredMonster
    },
    get hoveredCritter() {
      return hoveredCritter
    },
    dispose() {
      renderer.domElement.removeEventListener("pointerdown", onDown)
      renderer.domElement.removeEventListener("wheel", onWheel)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    },
  }
}
