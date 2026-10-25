// The white line round whatever the pointer is on (and round the player, always): one texel wide
// on sprites (actors.ts Figure.outline), and a thin shell round the creatures built of boxes.
import * as THREE from "three";

const shellMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide, fog: false });
shellMat.onBeforeCompile = (shader) => {
  // pushed out along the normals by about one screen texel
  shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed += normalize(objectNormal) * 0.025;");
};

/** Outline a creature made of meshes: a white back-face shell round each part. */
export function outlineShape(root: THREE.Object3D, on: boolean) {
  let shells = root.userData.shells as THREE.Mesh[] | undefined;
  if (!on && !shells) return;
  if (!shells) {
    shells = [];
    const parts: THREE.Mesh[] = [];
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !o.userData.shell) parts.push(o as THREE.Mesh);
    });
    for (const p of parts) {
      const s = new THREE.Mesh(p.geometry, shellMat);
      s.userData.shell = true;
      s.raycast = () => {};
      p.add(s);
      shells.push(s);
    }
    root.userData.shells = shells;
  }
  for (const s of shells) s.visible = on;
}

const spriteRims = new WeakMap<THREE.Sprite, THREE.Sprite>();

/** Outline a flat sprite (a hen, a cat) one texel wide, following its current frame. */
export function outlineSprite(sprite: THREE.Sprite, on: boolean) {
  let rim = spriteRims.get(sprite);
  if (!on && !rim) return;
  if (!rim) {
    const texel = { value: new THREE.Vector2() };
    const m = new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, depthWrite: false, fog: false });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.rimTexel = texel;
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec2 rimTexel;").replace(
        "#include <map_fragment>",
        `
          float self = texture2D(map, vMapUv).a;
          float side = max(max(texture2D(map, vMapUv + vec2(rimTexel.x, 0.0)).a, texture2D(map, vMapUv - vec2(rimTexel.x, 0.0)).a),
                           max(texture2D(map, vMapUv + vec2(0.0, rimTexel.y)).a, texture2D(map, vMapUv - vec2(0.0, rimTexel.y)).a));
          if (self > 0.5 || side < 0.5) discard;`,
      );
    };
    m.userData.texel = texel;
    rim = new THREE.Sprite(m);
    rim.raycast = () => {};
    rim.renderOrder = 998;
    sprite.add(rim);
    spriteRims.set(sprite, rim);
  }
  rim.visible = on;
  const m = rim.material,
    map = sprite.material.map;
  if (m.map !== map) {
    m.map = map;
    m.needsUpdate = true;
  }
  const img = map?.image as { width?: number; height?: number } | undefined;
  if (img?.width && img.height) (m.userData.texel as { value: THREE.Vector2 }).value.set(1 / img.width, 1 / img.height);
  rim.center.copy(sprite.center);
}
