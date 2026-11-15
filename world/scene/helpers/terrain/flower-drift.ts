import { vnoise } from "#/lib/engine/vnoise"

type Drifts = Readonly<{ kinds: readonly string[]; above: number }>

/**
 * Which flowers gather in drifts on each kind of land (flower-kinds.ts), and how much of the land
 * the drifts take: the higher `above`, the less. Neighbouring drifts are of neighbouring kinds in
 * the list, so the colours that meet are chosen to sit well side by side.
 */
const DRIFTS: Readonly<Record<string, Drifts>> = {
  meadow: { kinds: ["buttercup", "daisy", "lupinePink", "lupine", "lupineBlue", "cornflower", "poppy"], above: 0.57 },
  highland: { kinds: ["heather", "gentian", "daisy", "heather"], above: 0.6 },
  marsh: { kinds: ["marigold", "iris", "cottongrass", "irisGold"], above: 0.6 },
  valley: { kinds: ["primrose", "bluebell", "foxglove", "anemone"], above: 0.58 },
  forest: { kinds: ["anemone", "bluebell", "foxglove"], above: 0.64 },
  coast: { kinds: ["thrift", "daisy", "poppy", "thrift"], above: 0.6 },
  pass: { kinds: ["saxifrage", "gentian", "edelweiss"], above: 0.62 },
  dune: { kinds: ["verbena"], above: 0.7 },
  salt: { kinds: ["glasswort"], above: 0.66 },
}

/**
 * The drift of flowers at a place, if one lies there: which kind, and how thick it is (0 at the
 * drift's edge, towards 1 in its middle). The ground painter and the scene both ask here, so the
 * petals painted on the ground and the flowers standing on it agree.
 */
export function flowerDrift(biome: string, x: number, z: number): { kind: string; thick: number } | null {
  const drifts = DRIFTS[biome]
  if (!drifts) return null
  const v = vnoise({ x: x, y: z, scale: 0.17, seed: 701 }) * 0.64 + vnoise({ x: x, y: z, scale: 0.55, seed: 702 }) * 0.36
  if (v <= drifts.above) return null
  // which kind: a slower field, stretched so the kinds at the ends of the list get their share
  const w = vnoise({ x: x, y: z, scale: 0.085, seed: 703 }) * 0.8 + vnoise({ x: x, y: z, scale: 0.3, seed: 704 }) * 0.2
  const t = Math.min(0.999, Math.max(0, (w - 0.27) / 0.46))
  return { kind: drifts.kinds[Math.floor(t * drifts.kinds.length)], thick: Math.min(1, (v - drifts.above) / 0.22) }
}
