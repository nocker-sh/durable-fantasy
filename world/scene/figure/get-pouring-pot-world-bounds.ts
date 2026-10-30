import { getPouringPotNativeParts } from "./get-pouring-pot-native-parts"

type Props = Pick<Parameters<typeof getPouringPotNativeParts>[0], "profile" | "pose">

/** 胴と片口の外包と、全ての柄の半径を部屋の座標で囲む。 */
export function getPouringPotWorldBounds(props: Props): readonly [number, number, number, number] | Error {
  const parts = getPouringPotNativeParts({ ...props, body: [0, 0], heading: 0, rootY: 0 })
  if (parts instanceof Error) return parts
  if (!parts.bars.length || parts.bars.some((bar) => !bar.from.every(Number.isFinite) || !bar.to.every(Number.isFinite) || !Number.isFinite(bar.radius) || bar.radius <= 0))
    return new Error("Invalid pouring pot handle bounds")
  const x = parts.bars.flatMap((bar) => [bar.from[0] - bar.radius, bar.to[0] - bar.radius, bar.from[0] + bar.radius, bar.to[0] + bar.radius])
  const z = parts.bars.flatMap((bar) => [bar.from[2] - bar.radius, bar.to[2] - bar.radius, bar.from[2] + bar.radius, bar.to[2] + bar.radius])
  const bounds: readonly [number, number, number, number] = [Math.min(parts.body.x0, ...x), Math.min(parts.body.z0, ...z), Math.max(parts.body.x1, ...x), Math.max(parts.body.z1, ...z)]
  if (!bounds.every(Number.isFinite) || bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) return new Error("Invalid pouring pot world bounds")
  return bounds
}
