import * as THREE from "three"
import { updaters, movingObjects } from "#/world/scene/construction/registry"

/** A night stall's lamp under the awning, and steam off the food (both go with the stall). */
export function stallDressing(g: THREE.Object3D, steam: boolean) {
  const glow = new THREE.MeshLambertMaterial({ color: 0x3a3020, emissive: new THREE.Color(0xffc060), emissiveIntensity: 1.6 })
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.14), glow)
  lamp.position.set(0.7, 1.5, 0.35)
  g.add(lamp)
  const light = new THREE.PointLight(0xffb060, 1.6, 4.5, 1.6)
  light.position.set(0.7, 1.4, 0.6)
  g.add(light)
  if (!steam) return
  const puffs = [0, 1, 2].map((k) => {
    const p = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xe8e4e0, transparent: true, opacity: 0.35, depthWrite: false }))
    g.add(p)
    movingObjects.add(p)
    return { p, k }
  })
  updaters.push((t) =>
    puffs.forEach((inputProps) => {
      const p = inputProps.p
      const k = inputProps.k

      const a = (t * 0.5 + k / 3) % 1
      p.position.set(-0.3 + Math.sin(t + k) * 0.08, 0.85 + a * 0.9, 0)
      p.scale.setScalar(0.18 + a * 0.3)
      ;(p.material as THREE.SpriteMaterial).opacity = 0.4 * (1 - a)
    }),
  )
}
