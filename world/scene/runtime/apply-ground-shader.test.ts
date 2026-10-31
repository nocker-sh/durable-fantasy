import { expect, it } from "vitest"
import { Texture } from "three"
import { applyGroundShader } from "#/world/scene/runtime/apply-ground-shader"
import { WATER_Y } from "#/world/scene/world"

it("keeps existing uniforms and shader code while selecting wall and ground pixels by normal", () => {
  const wall = new Texture()
  const marker = { value: 5 }
  const shader = { uniforms: { marker }, vertexShader: "before\n#include <common>\n#include <begin_vertex>\nafter", fragmentShader: "before\n#include <common>\n#include <map_fragment>\nafter" }
  applyGroundShader(shader, wall)
  expect(shader.uniforms).toEqual({ marker, wallMap: { value: wall } })
  expect(shader.vertexShader).toContain("vWP = (modelMatrix * vec4(transformed, 1.0)).xyz")
  expect(shader.vertexShader).toContain("vWN = normalize(mat3(modelMatrix) * objectNormal)")
  expect(shader.fragmentShader).toContain("wuv * 0.25")
  expect(shader.fragmentShader).toContain(`if (vWP.y < ${(WATER_Y + 0.05).toFixed(2)}) wcol.rgb *= vec3(0.62, 0.74, 0.7)`)
  expect(shader.fragmentShader).toContain("diffuseColor *= vWN.y < 0.62 ? wcol : gcol;")
  expect(shader.fragmentShader).not.toContain("#include <map_fragment>")
  expect(shader.vertexShader.startsWith("before\n")).toBe(true)
  expect(shader.fragmentShader.endsWith("\nafter")).toBe(true)
  wall.dispose()
})
