import { FRIEND_MAX } from "#/world/core/friendship-rules"

/** 元の記録を変えず、指定した住民への親しさを上限まで増やす。 */
export function befriend(friends: Readonly<Record<string, number>>, name: string, by: number): Record<string, number> {
  return { ...friends, [name]: Math.min(FRIEND_MAX, (friends[name] ?? 0) + by) }
}
