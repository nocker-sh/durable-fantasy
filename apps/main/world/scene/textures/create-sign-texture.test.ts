import { createHash } from "node:crypto"
import { expect, it } from "vitest"
import { createSignTexture } from "#/world/scene/textures/create-sign-texture"

const textures = [
  { kind: "bread", digest: "bd67dfbfe76711f078c2a390ce6bace54ed761d0ad83c4d23bb8e9fddedc4856" },
  { kind: "anvil", digest: "85aa83d28f65d79426c9b92eb098632923623259fcae85af2e58ee93fcc2fbf3" },
  { kind: "mug", digest: "eef09f433603d37fbb32949e063cc20974409170bf202961065767953066db3d" },
  { kind: "cross", digest: "451c31c57d0a627c5828eaac51b93317558d7b32d5a5112efc83b8784b1c3652" },
  { kind: "potion", digest: "6e5e4121e5b7a912427b983678782c30185620e66ed58a63d64196c719b4b92b" },
  { kind: "crystal", digest: "d755a6a4791e98f4a8467c9d0a247f4448d5ec2c331e10640235250ff18e5270" },
  { kind: "needle", digest: "33630571ea900070480ff960d6b8d2d15cb7129ca5a577bf1dab996243ca9a88" },
  { kind: "shield", digest: "a64b6ab3a0ba2afbfe1ada941390710dc632bc6423bc333774f1efd66ea9b7f7" },
  { kind: "bow", digest: "e39d77768265ba3b71dedfa68bd443308ce3293653700745fb89b59c02ed8a1d" },
  { kind: "hide", digest: "0d291bb5671d24f6af25624d1c8f4d829670516704e5ac7a08c75a1d26b1d4e7" },
  { kind: "scale", digest: "b84ad26fcda6c2c1a77a0c5e2d2b90ff18e011e5d8c40f784bb8fb38a146f00f" },
  { kind: "bag", digest: "d5cfdf6a90da1b1e41aa4215ecab63cbfccf4a105715a2eadcfee30a3dcf0f1b" },
  { kind: "key", digest: "72b81698fd9d3916c8494ff576f14fea9c2cc5a197dd3941b3df0f8dd6fb2543" },
]

it.each(textures)("retains the existing RGBA artwork for $kind", (texture) => {
  const buffer = createSignTexture(texture.kind)
  expect([buffer.w, buffer.h]).toEqual([24, 18])
  expect(createHash("sha256").update(buffer.data).digest("hex")).toBe(texture.digest)
})

it.each(["", "unknown", "constructor", "__proto__", "get", "toString"])("keeps an unrecognized emblem blank (%s)", (kind) => {
  expect(createSignTexture(kind).data).toEqual(createSignTexture("").data)
})

it("gives each sign its own pixel storage", () => {
  const first = createSignTexture("bread")
  const second = createSignTexture("bread")
  expect(first.data).not.toBe(second.data)
  const original = second.data[0]
  first.data[0] = 255 - original
  expect(second.data[0]).toBe(original)
})
