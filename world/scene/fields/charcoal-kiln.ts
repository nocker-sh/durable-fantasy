import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { chimneys, fireLights } from "#/world/scene/construction/registry"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"

export function charcoalKiln(root: THREE.Group, x: number, z: number) {
  // Josef's charcoal mound, banked with earth and smoking day and night
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), colorMat(0x4a3a34))
  dome.position.set(x, groundH(x, z) - 0.1, z)
  dome.scale.y = 0.8
  dome.castShadow = true
  dome.receiveShadow = true
  root.add(dome)
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), new THREE.MeshBasicMaterial({ color: 0xff7a30 }))
  glow.position.set(x, groundH(x, z) + 0.15, z + 1.17)
  root.add(glow)
  const l = new THREE.PointLight(0xff8a3a, 1.2, 4, 1.5)
  l.position.set(x, groundH(x, z) + 0.4, z + 1.5)
  root.add(l)
  fireLights.push({ light: l, base: 1.2, seed: x })
  chimneys.push(new THREE.Vector3(x, groundH(x, z) + 1.0, z))
  blockCircle(x, z, 1.4)
}
