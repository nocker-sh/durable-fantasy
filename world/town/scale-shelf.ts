import type { ShelfSpec } from "#/world/town/shelf"

export function scaleShelf(s: ShelfSpec, k: number): ShelfSpec {
  const items = s.items?.map((item) => {
    const r = item.retrieval
    return {
      ...item,
      across: item.across * k,
      fromBack: item.fromBack * k,
      width: item.width * k,
      height: item.height * k,
      depth: item.depth * k,
      tool: item.tool ? { handleWidth: item.tool.handleWidth * k, bladeLength: item.tool.bladeLength * k } : undefined,
      wall: item.wall === undefined ? undefined : item.wall * k,
      lid: item.lid === undefined ? undefined : item.lid * k,
      lidHandle: item.lidHandle ? { span: item.lidHandle.span * k, depth: item.lidHandle.depth * k, height: item.lidHandle.height * k, thickness: item.lidHandle.thickness * k } : undefined,
      lidLift: item.lidLift === undefined ? undefined : item.lidLift * k,
      retrieval: r ? { ...r, withdraw: r.withdraw * k, bodyRadius: r.bodyRadius * k, bodyAcross: r.bodyAcross * k, bodyStart: r.bodyStart * k, bodyEnd: r.bodyEnd * k } : undefined,
    }
  })
  return { height: s.height * k, board: s.board * k, levels: s.levels.map((y) => y * k), items, front: s.front }
}
