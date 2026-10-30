import type * as THREE from "three"
import { PositionSample } from "#/lib/engine/position-sample"
import { PathFollower } from "#/lib/engine/path-follower"
import { walkH } from "#/world/scene/walk-h"
import { ANIM_DUR } from "#/world/scene/figure/animation"
import type { Anim } from "#/world/scene/figure/animation"
import type { Look } from "#/world/scene/figure/look"
import { Figure } from "#/world/scene/figure/figure"
import { wearable } from "#/world/town/wearable"
import type { Avatar, Cell } from "#/world/scene/runtime/types"
import type { Walker } from "#/world/scene/runtime/walker"
import { snap } from "#/world/scene/runtime/snap"
import { center } from "#/world/scene/runtime/center"
import { STEP_SPEED } from "#/world/scene/runtime/grid"

export function createWalkers(scene: THREE.Scene, onPickPlayer: (id: string) => void, figureScale = 1) {
  // ---------------------------------------------------------------- walkers (the player and other players)
  let layer: HTMLElement | null = null
  const plate = (cls: string, text: string) => {
    const el = document.createElement("div")
    el.className = cls
    el.textContent = text
    layer?.appendChild(el)
    return el
  }
  function makeFigure(a: Avatar) {
    const fig = new Figure(wearable(a.look), undefined, figureScale)
    fig.hold(a.held)
    scene.add(fig.root)
    return fig
  }
  function dropFigure(fig: Figure) {
    fig.dispose()
  }
  const lookId = (l: Look) => JSON.stringify(l)
  const looks = new WeakMap<Walker, string>()

  const me: Walker = {
    id: "me",
    name: "",
    pos: snap([19.25, 40.25]),
    path: [],
    head: Math.PI,
    t: 0,
    fig: makeFigure({ name: "", held: null, look: { top: "cCream", bottom: "cGray", jacket: "cRed", sex: "m", skin: "skin1", hair: "hBrown", style: "curly", eye: "cBlue" } }),
    label: plate("gx-nameplate gx-nameplate--me", ""),
  }
  const movement = {
    get pos() {
      return me.pos
    },
    get path() {
      return me.path
    },
    yaw: Math.PI / 4,
    yawTarget: Math.PI / 4,
  }
  const remotes = new Map<string, Walker>()

  function setAvatar(a: Avatar) {
    me.name = a.name
    me.label.textContent = a.name
    if (looks.get(me) !== lookId(a.look)) {
      dropFigure(me.fig)
      me.fig = makeFigure(a)
      looks.set(me, lookId(a.look))
      me.fig.prefetch("idle", a.held)
      me.fig.prefetch("walk", a.held)
    } else if (me.fig.item !== a.held) {
      me.fig.hold(a.held)
      me.fig.prefetch("idle", a.held)
      me.fig.prefetch("walk", a.held)
    }
  }
  function addRemote(id: string, a: Avatar, at: Cell) {
    if (remotes.has(id)) {
      updateRemote(id, a)
      moveRemote(id, [at])
      return
    }
    const w: Walker = { id, name: a.name, fig: makeFigure(a), pos: center(at), path: [], head: Math.random() * Math.PI * 2, t: 0, label: plate("gx-nameplate gx-nameplate--player", a.name) }
    // another player's name can be clicked (to trade with them)
    w.label.addEventListener("click", (e) => {
      e.stopPropagation()
      onPickPlayer(id)
    })
    looks.set(w, lookId(a.look))
    w.fig.prefetch("idle", a.held)
    w.fig.prefetch("walk", a.held)
    remotes.set(id, w)
  }
  function updateRemote(id: string, a: Avatar) {
    const w = remotes.get(id)
    if (!w) return
    w.name = a.name
    w.label.textContent = a.name
    if (looks.get(w) !== lookId(a.look)) {
      dropFigure(w.fig)
      w.fig = makeFigure(a)
      looks.set(w, lookId(a.look))
    } else w.fig.hold(a.held)
    w.fig.prefetch("idle", a.held)
    w.fig.prefetch("walk", a.held)
  }
  function removeRemote(id: string) {
    const w = remotes.get(id)
    if (!w) return
    dropFigure(w.fig)
    w.label.remove()
    remotes.delete(id)
  }
  function clearRemotes() {
    for (const id of remotes.keys()) removeRemote(id)
  }
  function moveRemote(id: string, cells: Cell[]) {
    const w = remotes.get(id)
    if (!w || !cells.length) return
    const pts = cells.map(center)
    // far from where the path starts (missed messages): appear there
    if (Math.hypot(pts[0][0] - w.pos[0], pts[0][1] - w.pos[1]) > 2) w.pos = pts[0]
    w.path = pts
  }
  /** what the player is doing with their hands for a moment (chopping, picking, fishing) */
  let action: { anim: Anim; until: number } | null = null
  /** Step along the path from cell centre to cell centre; returns true while walking. */
  const follower = new PathFollower(STEP_SPEED)
  function stepWalker(w: Walker, dt: number, elapsed = dt) {
    if (!w.path.length && w === me && action && performance.now() < action.until) {
      w.t += (dt * Math.PI * 2) / ANIM_DUR[action.anim]
      w.fig.pose(action.anim, w.t)
      return false
    }
    if (!w.path.length) {
      w.t += (dt * Math.PI * 2) / ANIM_DUR.idle
      w.fig.pose("idle", w.t)
      return false
    }
    const heading = follower.advance(w, elapsed)
    if (heading !== null) {
      let diff = heading - w.head
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      w.head += diff * Math.min(1, dt * 14)
    }
    w.t += dt * 13
    w.fig.pose("walk", w.t)
    return true
  }
  const ground = new WeakMap<Walker, PositionSample>()
  function placeWalker(w: Walker) {
    let height = ground.get(w)
    if (!height) {
      height = new PositionSample(walkH)
      ground.set(w, height)
    }
    w.fig.root.position.set(w.pos[0], height.at(w.pos[0], w.pos[1]), w.pos[1])
    w.fig.face(w.head)
    w.fig.refresh()
  }

  return {
    me,
    movement,
    remotes,
    setAvatar,
    addRemote,
    updateRemote,
    removeRemote,
    clearRemotes,
    moveRemote,
    stepWalker,
    placeWalker,
    plate,
    get layer() {
      return layer
    },
    set layer(value: HTMLElement | null) {
      layer = value
    },
    get action() {
      return action
    },
    set action(value: typeof action) {
      action = value
    },
  }
}
