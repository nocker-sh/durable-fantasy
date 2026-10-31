type Props = Readonly<{ size: number; resolution: number; heights: Readonly<ArrayLike<number>> }>

/** 行を北から南へ並べ、地面の座標と上下を反転したテクスチャ座標を同じ頂点へ結ぶ。 */
export function createHeightfieldVertices(props: Props) {
  const side = props.size * props.resolution + 1
  if (!Number.isFinite(props.resolution) || props.resolution <= 0 || !Number.isSafeInteger(side) || side < 2) throw new RangeError("Invalid heightfield dimensions")
  if (props.heights.length !== side * side) throw new RangeError("Heightfield heights do not match dimensions")
  const positions = new Float32Array(side * side * 3)
  const uv = new Float32Array(side * side * 2)
  for (const cursor = { index: 0 }; cursor.index < side * side; cursor.index++) {
    const index = cursor.index
    const x = index % side
    const z = Math.floor(index / side)
    positions[index * 3] = x / props.resolution
    positions[index * 3 + 1] = props.heights[index]
    positions[index * 3 + 2] = z / props.resolution
    uv[index * 2] = x / (side - 1)
    uv[index * 2 + 1] = 1 - z / (side - 1)
  }
  return { positions, uv, side }
}
