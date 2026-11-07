import { afterEach, expect, it, vi } from "vitest"
import { Vector3 } from "three"
import { PathFollower } from "#/lib/engine/path-follower"
import { createGameState } from "#/world/client/initial-state"
import { MAPS } from "#/world/maps"
import { walkable } from "#/world/maps/walkable"
import { WN } from "#/world/maps/ground/rules"
import { Keys, type KeyTarget } from "#/world/parts/keys"
import { MOVE_KEYS } from "#/world/parts/move-keys"
import { PendingAction } from "#/world/scene/runtime/action-target"
import { cellOf } from "#/world/scene/runtime/cell-of"
import { center } from "#/world/scene/runtime/center"
import { STEP_SPEED } from "#/world/scene/runtime/grid"
import { SceneMovement } from "#/world/scene/runtime/scene-movement"
import type { Cell } from "#/world/scene/runtime/types"
import type { Walker } from "#/world/scene/runtime/walker"
import { blocked } from "#/world/scene/world"

const cleanups: (() => void)[] = []
afterEach(() => {
  for (const clean of cleanups.splice(0)) clean()
  vi.unstubAllGlobals()
})

function fixture() {
  const document = Object.assign(new EventTarget(), { hidden: false })
  const viewport = Object.assign(new EventTarget(), { document })
  vi.stubGlobal("window", viewport)
  const map = MAPS.phanthiet
  expect(map.size).toBe(WN)
  const oldGrid = blocked.slice()
  const start = map.rows.flatMap((row, y) =>
    [...row].flatMap((_, x): Cell[] => {
      const clear = Array.from({ length: 25 }, (_, index): Cell => [x + (index % 5) - 2, y + Math.floor(index / 5) - 2]).every((at) => walkable(map, at))
      return clear ? [[x, y]] : []
    }),
  )[0]
  expect(start).toBeDefined()
  // Use the canonical walk grid as the active scene's local setup. Pathfinding,
  // held-route selection, stopping and physical following are real implementations.
  for (let y = 0; y < WN; y++) for (let x = 0; x < WN; x++) blocked[y * WN + x] = walkable(map, [x, y]) ? 0 : 1
  const me: Pick<Walker, "pos" | "path"> = { pos: center(start), path: [] }
  const sent: Cell[][] = []
  const movement = new SceneMovement({
    me,
    action: new PendingAction(),
    marker: { visible: false, position: new Vector3() },
    focus: new Vector3(),
    movement: { yaw: 0 },
    onWalk: (path) => sent.push(structuredClone(path)),
  })
  const state = createGameState()
  state.set({ ...state.get(), loading: null })
  const keys = new Keys({ state, hold: movement.hold, stopWalking: movement.stop } as unknown as KeyTarget)
  keys.listen()
  cleanups.push(() => {
    keys.unlisten()
    blocked.set(oldGrid)
  })
  const follower = new PathFollower({ speed: STEP_SPEED })
  return {
    document,
    keys,
    me,
    sent,
    movement,
    start,
    key(code: string, type = "keydown", modifier: "Meta" | "Control" | null = null, repeat = false) {
      const event = Object.assign(new Event(type, { cancelable: true }), {
        code,
        key: code.startsWith("Meta") ? "Meta" : code.startsWith("Control") ? "Control" : code.startsWith("Key") ? code.slice(3).toLowerCase() : code,
        metaKey: modifier === "Meta",
        ctrlKey: modifier === "Control",
        repeat,
      })
      Object.defineProperty(event, "target", { value: { closest: () => null } })
      viewport.dispatchEvent(event)
      return event
    },
    tick(frames: number) {
      for (let frame = 0; frame < frames; frame++) {
        movement.stepHeld()
        follower.advance(me, 1 / 60)
      }
    },
  }
}

for (const code of Object.keys(MOVE_KEYS))
  for (const modifier of ["Meta", "Control"] as const)
    for (const phase of ["keydown", "keyup"] as const)
      it(`${code}: ${modifier} ${phase} ends only keyboard-owned walking before a missed release`, () => {
        const f = fixture()
        f.key(code)
        f.tick(12)
        expect(f.sent.length).toBeGreaterThan(0)
        expect(f.me.path.length).toBeGreaterThan(0)
        const stoppingAt = f.me.path[0]
        const event = f.key(`${modifier}Left`, phase, phase === "keydown" ? modifier : null)
        expect(event.defaultPrevented).toBe(false)
        expect(f.me.path.length).toBeLessThanOrEqual(1)
        const sent = f.sent.length
        // No release for the walking key is delivered by the shortcut. A repeat
        // cannot restart it, and the current segment may finish before stopping.
        f.key(code, "keydown", null, true)
        f.tick(120)
        expect(f.sent).toHaveLength(sent)
        expect(f.me.path).toEqual([])
        expect(f.me.pos).toEqual(stoppingAt)
        f.key(code, "keyup")
        f.key(code)
        f.tick(1)
        expect(f.sent.length).toBeGreaterThan(sent)
      })

it.each(["Meta", "Control"] as const)("%s does not cancel an unrelated click route when no walking key owns it", (modifier) => {
  const f = fixture()
  const target = center([f.start[0] + 2, f.start[1]])
  expect(f.movement.walkTo(target)).toBe(true)
  const route = structuredClone(f.me.path)
  const sent = f.sent.length
  f.key(`${modifier}Left`, "keydown", modifier)
  f.key(`${modifier}Left`, "keyup")
  expect(f.me.path).toEqual(route)
  f.tick(120)
  expect(f.sent).toHaveLength(sent)
  expect(cellOf(f.me.pos)).toEqual(cellOf(target))
})

for (const code of Object.keys(MOVE_KEYS)) {
  it(`${code}: hiding without blur stops a real held route and requires a fresh press`, () => {
    const f = fixture()
    f.key(code)
    f.tick(12)
    expect(f.me.path.length).toBeGreaterThan(1)
    const stoppingAt = f.me.path[0]
    f.document.hidden = true
    f.document.dispatchEvent(new Event("visibilitychange"))
    expect(f.me.path).toEqual([stoppingAt])
    expect(f.sent.at(-1)).toEqual([cellOf(stoppingAt)])
    const sent = f.sent.length
    f.document.hidden = false
    f.document.dispatchEvent(new Event("visibilitychange"))
    f.key(code, "keydown", null, true)
    f.tick(120)
    expect(f.sent).toHaveLength(sent)
    expect(f.me.path).toEqual([])
    expect(f.me.pos).toEqual(stoppingAt)
    f.key(code, "keyup")
    f.key(code)
    f.tick(1)
    expect(f.sent.length).toBeGreaterThan(sent)
  })

  it(`${code}: visible notifications preserve the current held route`, () => {
    const f = fixture()
    f.key(code)
    f.tick(12)
    const route = structuredClone(f.me.path)
    const position = structuredClone(f.me.pos)
    const sent = f.sent.length
    f.document.dispatchEvent(new Event("visibilitychange"))
    expect(f.me.path).toEqual(route)
    expect(f.sent).toHaveLength(sent)
    f.tick(1)
    expect(f.me.pos).not.toEqual(position)
  })
}

it("hiding does not cancel a click route when no movement key owns it", () => {
  const f = fixture()
  const target = center([f.start[0] + 2, f.start[1]])
  expect(f.movement.walkTo(target)).toBe(true)
  const route = structuredClone(f.me.path)
  const sent = f.sent.length
  f.document.hidden = true
  f.document.dispatchEvent(new Event("visibilitychange"))
  expect(f.me.path).toEqual(route)
  f.tick(120)
  expect(f.sent).toHaveLength(sent)
  expect(cellOf(f.me.pos)).toEqual(cellOf(target))
})
