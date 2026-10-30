import { WINDMILL_ROTOR_SHAPE } from "#/world/scene/construction/windmill-rotor-shape"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { M } from "#/world/scene/construction/materials"
import { animateObject } from "#/world/scene/construction/animate-object"

export function windmill(root: THREE.Group, x: number, z: number) {
  const y0 = groundH(x, z)
  const gb = new GB()
  gb.cyl({ side: M.ashlar, top: null, centerX: x, centerZ: z, fromY: y0 - 0.3, toY: y0 + 4.2, fromRadius: 1.35, toRadius: 0.95, segments: 10, repeat: 4 })
  gb.box({ side: M.wood, top: null, x0: x - 0.3, y0: y0, z0: z + 1.14, x1: x + 0.3, y1: y0 + 1.1, z1: z + 1.3, repeat: 2 })
  root.add(gb.build())
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.25, 1.4, 10), M.thatch)
  cap.position.set(x, y0 + 4.9, z)
  cap.castShadow = true
  root.add(cap)
  const rotor = WINDMILL_ROTOR_SHAPE
  const hub = new THREE.Group()
  hub.position.set(x + rotor.hub[0], y0 + rotor.hub[1], z + rotor.hub[2])
  const sailM = mat(sailTex(), { alpha: true, side: THREE.DoubleSide })
  for (const index of Array.from({ length: rotor.arms }).keys()) {
    const arm = new THREE.Group()
    arm.rotation.z = index * ((2 * Math.PI) / rotor.arms)
    const beam = new THREE.Mesh(new THREE.BoxGeometry(...rotor.beam.size), M.woodDark)
    beam.position.set(...rotor.beam.centre)
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(...rotor.sail.size), sailM)
    sail.position.set(...rotor.sail.centre)
    beam.castShadow = sail.castShadow = true
    arm.add(beam, sail)
    hub.add(arm)
  }
  root.add(hub)
  animateObject(hub, (_t, dt) => {
    hub.rotation.z -= dt * rotor.angularSpeed
  })
  blockCircle(x, z, 1.5)
}

function sailTex(): PixBuf {
  const b = new PixBuf(22, 80)
  b.fill((x, y) => {
    const frame = x < 2 || x > 19 || y % 10 < 2
    if (frame) return pick({ ramp: "wood", b: 0.5, x: x, y: y })
    if ((x + y) % 7 === 0) return null
    return pick({ ramp: "cLinen", b: 0.62 + Math.sin(x * 0.5) * 0.08, x: x, y: y })
  })
  return b
}
