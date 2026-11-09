import * as THREE from "three"
import { walkH } from "#/world/scene/walk-h"
import { center } from "#/world/scene/runtime/center"

/** Exit rings share geometry and material for the lifetime of one map. */
export class WarpMarkers {
  private readonly geometry = new THREE.RingGeometry(0.42, 0.62, 24)
  private readonly material = new THREE.MeshBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide })
  private readonly marks: THREE.Mesh[] = []

  constructor(private readonly scene: THREE.Object3D) {}

  set(cells: readonly (readonly [number, number])[]) {
    while (this.marks.length > cells.length) this.marks.pop()!.removeFromParent()
    cells.forEach((cell, i) => {
      let mark = this.marks[i]
      if (!mark) {
        mark = new THREE.Mesh(this.geometry, this.material)
        mark.rotation.x = -Math.PI / 2
        this.scene.add(mark)
        this.marks.push(mark)
      }
      const p = center([cell[0], cell[1]])
      mark.position.set(p[0], walkH(p[0], p[1]) + 0.05, p[1])
    })
  }

  update(time: number) {
    this.material.opacity = 0.4 + Math.sin(time * 2) * 0.15
    for (const mark of this.marks) mark.rotation.z = time * 0.3
  }

  dispose() {
    for (const mark of this.marks) mark.removeFromParent()
    this.marks.length = 0
    this.geometry.dispose()
    this.material.dispose()
  }
}
