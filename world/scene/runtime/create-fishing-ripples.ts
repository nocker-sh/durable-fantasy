import { Mesh, MeshBasicMaterial, RingGeometry } from "three"
import { WATER_Y } from "#/world/scene/world"
import { groundH } from "#/world/scene/ground-h"
import { currentLayout } from "#/world/scene/current-layout"
import { updaters } from "#/world/scene/construction/registry"
import { findFishingWater } from "#/world/scene/runtime/find-fishing-water"
import type { Group } from "three"
import type { V2 } from "#/world/scene/construction/registry"

export function createFishingRipples(root: Group, at: V2, phase: number): void {
  const material = new MeshBasicMaterial({ color: 0xd8e8f0, transparent: true, opacity: 0.6, depthWrite: false })
  const ring = new Mesh(new RingGeometry(0.25, 0.32, 16), material)
  ring.rotation.x = -Math.PI / 2
  const wet = findFishingWater({ at, bridge: currentLayout().bridge, heightAt: groundH, waterHeight: WATER_Y })
  ring.position.set(wet[0], WATER_Y + 0.02, wet[1])
  root.add(ring)
  updaters.push((time) => {
    const step = (time * 0.6 + phase) % 1
    ring.scale.setScalar(0.6 + step * 1.6)
    material.opacity = 0.6 * (1 - step)
  })
}
