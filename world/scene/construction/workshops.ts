import * as THREE from "three"
import { GB } from "../gfx"
import { groundH, blockRect, blockCircle } from "../world"
import { M, coalMat } from "./materials.ts"
import { fireLights, chimneys, lamps } from "./registry.ts"

export function forge(root: THREE.Group, x: number, z: number) {
  const gb = new GB()
  const y0 = groundH(x, z)
  gb.box(M.stoneDark, M.stone, x - 0.6, y0 - 0.2, z - 0.5, x + 0.6, y0 + 0.75, z + 0.5, 4)
  gb.box(M.stone, M.stoneDark, x - 0.45, y0 + 1.6, z - 0.45, x + 0.45, y0 + 2.0, z + 0.45, 4) // hood
  gb.box(M.stone, M.stone, x - 0.25, y0 + 2.0, z - 0.25, x + 0.25, y0 + 3.6, z + 0.25, 4)
  gb.box(M.iron, null, x - 0.4, y0 + 0.75, z - 0.4, x - 0.35, y0 + 1.6, z - 0.35, 1)
  gb.box(M.iron, null, x + 0.35, y0 + 0.75, z - 0.4, x + 0.4, y0 + 1.6, z - 0.35, 1)
  root.add(gb.build())
  const coal = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), coalMat)
  coal.rotation.x = -Math.PI / 2
  coal.position.set(x, y0 + 0.76, z)
  root.add(coal)
  const l = new THREE.PointLight(0xff8a3a, 2.5, 6, 1.5)
  l.position.set(x, y0 + 1.1, z)
  root.add(l)
  fireLights.push({ light: l, base: 2.5, seed: x })
  chimneys.push(new THREE.Vector3(x, y0 + 3.7, z))
  blockRect(x - 0.7, z - 0.6, x + 0.7, z + 0.6)
}

export function anvil(gb: GB, x: number, z: number) {
  const y0 = groundH(x, z)
  gb.cyl(M.woodV, M.wood, x, z, y0 - 0.1, y0 + 0.45, 0.25, 0.23, 8, 2)
  gb.box(M.iron, M.iron, x - 0.12, y0 + 0.45, z - 0.1, x + 0.12, y0 + 0.62, z + 0.1, 1)
  gb.box(M.iron, M.iron, x - 0.32, y0 + 0.62, z - 0.12, x + 0.25, y0 + 0.74, z + 0.12, 1)
  gb.box(M.iron, M.iron, x + 0.25, y0 + 0.66, z - 0.06, x + 0.4, y0 + 0.74, z + 0.06, 1)
  blockCircle(x, z, 0.35)
}

export function oven(root: THREE.Group, x: number, z: number) {
  const y0 = groundH(x, z)
  const gb = new GB()
  gb.box(M.stoneDark, M.stone, x - 0.9, y0 - 0.2, z - 0.9, x + 0.9, y0 + 0.6, z + 0.9, 4)
  gb.box(M.dark, null, x - 0.3, y0 + 0.62, z + 0.85, x + 0.3, y0 + 1.0, z + 0.96, 1)
  root.add(gb.build())
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M.stone)
  dome.position.set(x, y0 + 0.6, z)
  dome.castShadow = true
  root.add(dome)
  const fire = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), coalMat)
  fire.position.set(x, y0 + 0.75, z + 0.97)
  root.add(fire)
  const l = new THREE.PointLight(0xff9a40, 1.6, 4, 1.5)
  l.position.set(x, y0 + 0.9, z + 1.3)
  root.add(l)
  fireLights.push({ light: l, base: 1.6, seed: z })
  chimneys.push(new THREE.Vector3(x, y0 + 1.5, z))
  blockRect(x - 1.0, z - 1.0, x + 1.0, z + 1.0)
}

export function trough(gb: GB, x: number, z: number, alongX = true) {
  const y0 = groundH(x, z)
  const hw = alongX ? 0.7 : 0.25,
    hd = alongX ? 0.25 : 0.7
  gb.box(M.wood, null, x - hw, y0, z - hd, x + hw, y0 + 0.35, z + hd, 2)
  gb.box(M.water, M.water, x - hw + 0.06, y0, z - hd + 0.06, x + hw - 0.06, y0 + 0.3, z + hd - 0.06, 2)
  blockRect(x - hw, z - hd, x + hw, z + hd)
}

export function lantern(root: THREE.Group, x: number, z: number) {
  const gb = new GB()
  const y0 = groundH(x, z)
  gb.box(M.woodDark, M.woodDark, x - 0.06, y0 - 0.2, z - 0.06, x + 0.06, y0 + 2.2, z + 0.06, 2)
  gb.box(M.woodDark, M.woodDark, x - 0.06, y0 + 2.1, z - 0.06, x + 0.5, y0 + 2.18, z + 0.06, 2)
  gb.box(M.iron, M.iron, x + 0.32, y0 + 1.75, z - 0.1, x + 0.52, y0 + 1.78, z + 0.1, 1)
  root.add(gb.build())
  const gm = new THREE.MeshLambertMaterial({ color: 0x3a3020, emissive: new THREE.Color(0xffc060), emissiveIntensity: 0 })
  const g = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.16), gm)
  g.position.set(x + 0.42, y0 + 1.92, z)
  root.add(g)
  const l = new THREE.PointLight(0xffb060, 0, 5, 1.6)
  l.position.set(x + 0.42, y0 + 1.8, z)
  root.add(l)
  lamps.push({ light: l, glow: gm, x, z })
  blockCircle(x, z, 0.2)
}
