import { NODES } from "#/world/core/gather"

/** 定義順を保った採集場所を、識別子から引く。 */
export function nodeOf(id: string) {
  return NODES.find((node) => node.id === id)
}
