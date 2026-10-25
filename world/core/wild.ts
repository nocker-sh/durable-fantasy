// How the creatures of one channel of a map are faring (game-system.md §8): their hurts, who is
// fighting each one, and who is off licking their wounds until when. Pure; the wild Durable Object keeps it.
import { CLAIM_MS, MONSTER_KINDS, spawnOf } from "./monsters.ts";

export interface WildState {
  hp: Record<string, number>;
  back: Record<string, number>;
  /** who is fighting it, and when they last struck */
  by: Record<string, { player: string; at: number }>;
}

export const emptyWild = (): WildState => ({ hp: {}, back: {}, by: {} });

/** Is it about (not off recovering) at `now`? */
export const about = (s: WildState, id: string, now: number) => (s.back[id] ?? 0) <= now;

/** Who it is fighting now, if anyone (a fight left alone lapses). */
export function fighting(s: WildState, id: string, now: number): string | null {
  const f = s.by?.[id];
  return f && now - f.at < CLAIM_MS ? f.player : null;
}

export function hpOf(s: WildState, id: string, now: number): number {
  const spawn = spawnOf(id);
  if (!spawn) return 0;
  if (!about(s, id, now)) return 0;
  // left alone, it has got its breath back
  if (!fighting(s, id, now)) return MONSTER_KINDS[spawn.kind].hp;
  return s.hp[id] ?? MONSTER_KINDS[spawn.kind].hp;
}

/**
 * A blow from `player` (damage 0 for a miss): what it has left, and whether that beat it (it goes off
 * and is back after its respawn time). A creature already fighting someone else is not theirs to strike.
 */
export function hit(s: WildState, id: string, damage: number, now: number, player: string): { state: WildState; hp: number; beaten: boolean; refused: boolean } {
  const spawn = spawnOf(id);
  if (!spawn || !about(s, id, now)) return { state: s, hp: 0, beaten: false, refused: false };
  const other = fighting(s, id, now);
  if (other && other !== player) return { state: s, hp: hpOf(s, id, now), beaten: false, refused: true };
  const hp = Math.max(0, hpOf(s, id, now) - damage);
  const by = { ...s.by };
  if (hp > 0) return { state: { ...s, hp: { ...s.hp, [id]: hp }, by: { ...by, [id]: { player, at: now } } }, hp, beaten: false, refused: false };
  const rest = { ...s.hp };
  delete rest[id];
  delete by[id];
  return { state: { hp: rest, by, back: { ...s.back, [id]: now + MONSTER_KINDS[spawn.kind].respawn * 1000 } }, hp: 0, beaten: true, refused: false };
}
