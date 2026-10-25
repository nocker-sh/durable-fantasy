// A plain flood fill over a map's walk grid, for tests: can you get from `from` to a cell that `goal` accepts?
import { walkable, type Cell, type MapDefinition } from "../maps/index.ts";

export function findPathCells(map: MapDefinition, from: Cell, goal: (c: Cell) => boolean): boolean {
  const seen = new Set<number>([from[1] * map.size + from[0]]);
  const queue: Cell[] = [from];
  while (queue.length) {
    const c = queue.shift()!;
    if (goal(c)) return true;
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const n: Cell = [c[0] + dx, c[1] + dz];
      const k = n[1] * map.size + n[0];
      if (seen.has(k) || !walkable(map, n)) continue;
      seen.add(k);
      queue.push(n);
    }
  }
  return false;
}
