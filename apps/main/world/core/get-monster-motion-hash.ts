/** 時刻による移動の位相と休憩点で共有し、サーバーと描画で同じ値にする。 */
export function getMonsterMotionHash(id: string, seed: number): number {
  const hash = Array.from(id).reduce((value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619), 2166136261 ^ seed)
  const mixed = Math.imul(hash ^ (hash >>> 13), 0x5bd1e995)
  return ((mixed ^ (mixed >>> 15)) >>> 0) / 4294967296
}
