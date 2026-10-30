import * as THREE from "three"
const spriteRims = new WeakMap<THREE.Sprite, THREE.Sprite>()
/** Outline a flat sprite (a hen, a cat) one texel wide, following its current frame. */
export function outlineSprite(sprite: THREE.Sprite, on: boolean) {
  let rim = spriteRims.get(sprite)
  if (!on && !rim) return
  if (!rim) {
    const texel = { value: new THREE.Vector2() }
    const m = new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, depthWrite: false, fog: false })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.rimTexel = texel
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec2 rimTexel;").replace(
        "#include <map_fragment>",
        `
          float self = texture2D(map, vMapUv).a;
          float side = max(max(texture2D(map, vMapUv + vec2(rimTexel.x, 0.0)).a, texture2D(map, vMapUv - vec2(rimTexel.x, 0.0)).a),
                           max(texture2D(map, vMapUv + vec2(0.0, rimTexel.y)).a, texture2D(map, vMapUv - vec2(0.0, rimTexel.y)).a));
          if (self > 0.5 || side < 0.5) discard;`,
      )
    }
    m.userData.texel = texel
    rim = new THREE.Sprite(m)
    rim.raycast = () => {}
    rim.renderOrder = 998
    sprite.add(rim)
    spriteRims.set(sprite, rim)
  }
  rim.visible = on
  const m = rim.material,
    map = sprite.material.map
  if (m.map !== map) {
    m.map = map
    m.needsUpdate = true
  }
  const img = map?.image as { width?: number; height?: number } | undefined
  if (img?.width && img.height) (m.userData.texel as { value: THREE.Vector2 }).value.set(1 / img.width, 1 / img.height)
  rim.center.copy(sprite.center)
}
