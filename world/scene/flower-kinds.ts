/**
 * The flowers that grow in drifts outside town, all of them plants of a cold country
 * (world.md「気候と灰」): what colour their petals and hearts are, how they stand, and how tall.
 * The ground is painted with the same colours where a drift lies (helpers/terrain/drift-petal.ts),
 * and the flowers themselves stand on it (fields/blooms.ts).
 *
 * - spike: florets stacked up a stem (lupine, foxglove, heather)
 * - head: one round flower on a stem (poppy, daisy, gentian)
 * - bell: a bowed stem with bells hanging from it
 * - plume: a tuft of white down on a stem (cottongrass)
 * - flag: sword leaves and a three-petalled flower (iris)
 * - mat: fleshy stubs low on the ground (glasswort)
 */
export type FlowerForm = "spike" | "head" | "bell" | "plume" | "flag" | "mat"

export type FlowerKind = Readonly<{
  form: FlowerForm
  /** petal colours from the shaded to the lit */
  petals: readonly string[]
  heart: string
  /** height against the tallest, 0–1 */
  tall: number
}>

export const FLOWER_KINDS: Readonly<Record<string, FlowerKind>> = {
  lupine: { form: "spike", petals: ["#5a4a9c", "#7c64c4", "#a48ce0"], heart: "#e8e0f4", tall: 1 },
  lupinePink: { form: "spike", petals: ["#a04a7c", "#cc6c9c", "#eaa0c0"], heart: "#fbe6ee", tall: 0.95 },
  lupineBlue: { form: "spike", petals: ["#3c5aa8", "#5c80d0", "#8cb0ec"], heart: "#e6f0fa", tall: 0.95 },
  foxglove: { form: "spike", petals: ["#8c3c74", "#b85a94", "#dc8cb8"], heart: "#f6e0ea", tall: 1 },
  heather: { form: "spike", petals: ["#7c3c78", "#a85c9c", "#cc88bc"], heart: "#e8c0dc", tall: 0.5 },
  poppy: { form: "head", petals: ["#b83a2c", "#e0503a", "#f27a50"], heart: "#2a2030", tall: 0.75 },
  daisy: { form: "head", petals: ["#d8d4c8", "#f4f0e4", "#fffcf2"], heart: "#f0c040", tall: 0.6 },
  cornflower: { form: "head", petals: ["#3c50b4", "#5674dc", "#86a0f0"], heart: "#2c3470", tall: 0.8 },
  buttercup: { form: "head", petals: ["#d0a020", "#f0c838", "#fce070"], heart: "#c88a18", tall: 0.55 },
  marigold: { form: "head", petals: ["#d88a18", "#f4b028", "#fcd458"], heart: "#b86a14", tall: 0.5 },
  primrose: { form: "head", petals: ["#d8c868", "#f2e690", "#fcf6c0"], heart: "#e0a030", tall: 0.4 },
  anemone: { form: "head", petals: ["#d0c8d8", "#f0eaf2", "#ffffff"], heart: "#e8d060", tall: 0.45 },
  thrift: { form: "head", petals: ["#c05c88", "#e884a8", "#f8b4c8"], heart: "#f8d4e0", tall: 0.45 },
  gentian: { form: "head", petals: ["#2c3cac", "#3c5cd8", "#6c8cf0"], heart: "#e0e8fc", tall: 0.35 },
  saxifrage: { form: "head", petals: ["#b46c9c", "#dc98c0", "#f4c8dc"], heart: "#f8e890", tall: 0.3 },
  edelweiss: { form: "head", petals: ["#c8ccc8", "#e8ece6", "#fbfdf8"], heart: "#d8c060", tall: 0.35 },
  verbena: { form: "head", petals: ["#a8508c", "#d078b0", "#eca8cc"], heart: "#f6dce8", tall: 0.3 },
  bluebell: { form: "bell", petals: ["#4450b0", "#6474d8", "#94a4f0"], heart: "#c8d0f8", tall: 0.6 },
  cottongrass: { form: "plume", petals: ["#d4d8d4", "#f0f2ee", "#ffffff"], heart: "#ffffff", tall: 0.7 },
  iris: { form: "flag", petals: ["#5038a0", "#7458c8", "#a088e4"], heart: "#f0c840", tall: 0.95 },
  irisGold: { form: "flag", petals: ["#c89820", "#ecc038", "#fbe078"], heart: "#a86a18", tall: 0.9 },
  glasswort: { form: "mat", petals: ["#8c2c34", "#c4443c", "#e8744c"], heart: "#f09a5c", tall: 0.35 },
}
