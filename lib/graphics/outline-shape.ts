import * as THREE from "three"
const shellMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide, fog: false })
shellMat.onBeforeCompile = (shader) => {
  // Rigid mesh shells use the normal attribute; BasicMaterial only declares objectNormal
  // when environment mapping or skinning is enabled.
  shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed += normalize(normal) * 0.025;")
}

/** Outline a creature made of meshes: a white back-face shell round each part. */
export function outlineShape(root: THREE.Object3D, on: boolean) {
  let shells = root.userData.shells as THREE.Mesh[] | undefined
  if (!on && !shells) return
  if (!shells) {
    shells = []
    const parts: THREE.Mesh[] = []
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !o.userData.shell) parts.push(o as THREE.Mesh)
    })
    for (const p of parts) {
      const s = new THREE.Mesh(p.geometry, shellMat)
      s.userData.shell = true
      s.raycast = () => {}
      p.add(s)
      shells.push(s)
    }
    root.userData.shells = shells
  }
  for (const s of shells) s.visible = on
}
