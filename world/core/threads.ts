// Friends (world.md "マフラー"): parting, two people may undo the end of their mufflers and swap a
// thread. With someone's thread you can follow it across into their world — their town — and your
// own muffler pulls you home again. Pure; the player Durable Object keeps the threads.
import { hometownOf } from "../channels.ts";

/** A thread you hold: whose (their name, and a mark that tells them apart without giving away who they are), and their town. */
export interface Thread {
  key: string;
  name: string;
  town: number;
  at: number;
}

export const MAX_THREADS = 50;

/** A mark for a player that cannot be turned back into their id (their id is their key to their things). */
export function threadKey(owner: string): string {
  let h = 2166136261;
  for (const c of `muffler:${owner}`) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  let g = 5381;
  for (const c of owner) g = (Math.imul(g, 33) ^ c.charCodeAt(0)) >>> 0;
  return `${(h >>> 0).toString(36)}${g.toString(36)}`;
}

/** The thread someone gives: from their id, name and home town. */
export const threadOf = (owner: string, name: string, at: number): Thread => ({ key: threadKey(owner), name, town: hometownOf(owner), at });

/** Keep a thread (a newer one from the same person replaces the old; the oldest go when there are too many). */
export function keep(threads: readonly Thread[], t: Thread): Thread[] {
  return [...threads.filter((x) => x.key !== t.key), t].slice(-MAX_THREADS);
}

/** May someone be in this town: their own, or a friend's whose thread they hold. */
export const mayVisit = (owner: string, threads: readonly Thread[], town: number) => town === hometownOf(owner) || threads.some((t) => t.town === town);
