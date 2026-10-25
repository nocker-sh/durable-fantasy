import { describe, expect, it } from "vitest";
import { MAPS, cellDistance, npcCell, walkable } from "./maps/index.ts";
import { cellsReached, validPath, type Cell } from "./protocol.ts";

const town = MAPS.phanthiet;
const free = (c: Cell) => walkable(town, c);

describe("map data", () => {
  it("has a square walk grid with the spawn on a free cell", () => {
    expect(town.rows).toHaveLength(town.size);
    expect(town.rows.every((r: string) => r.length === town.size)).toBe(true);
    expect(free(town.spawn as Cell)).toBe(true);
  });

  it("knows where every shopkeeper stands", () => {
    // by night the stalls and the smithy, by morning the fish stall and the bakery window, on the square;
    // the bakery and inn keepers inside, at their hours (town/routines.ts)
    for (const name of ["オットー", "グレーテ", "ギュンター"]) expect(npcCell(town, name, 22 * 60)).not.toBeNull();
    for (const name of ["ヤコブ", "ハンス"]) expect(npcCell(town, name, 10 * 60)).not.toBeNull();
    expect(npcCell(MAPS["phanthiet-in-bakery"], "マルタ", 8 * 60)).not.toBeNull();
    expect(npcCell(MAPS["phanthiet-in-inn"], "ゲルダ", 20 * 60)).not.toBeNull();
    // and nobody at all at the stalls while the night market sleeps
    expect(npcCell(town, "オットー", 12 * 60)).toBeNull();
  });
});

describe("paths", () => {
  const start: Cell = [38, 80];

  it("accepts steps of one cell over free ground", () => {
    expect(validPath([start], [start, [38, 79], [39, 78]], free)).toBe(true);
  });

  it("refuses jumps, a start away from the player and blocked cells", () => {
    expect(validPath([start], [start, [38, 77]], free)).toBe(false);
    expect(
      validPath(
        [start],
        [
          [50, 50],
          [50, 51],
        ],
        free,
      ),
    ).toBe(false);
    expect(
      validPath(
        [[1, 1]],
        [
          [1, 1],
          [0, 0],
        ],
        free,
      ),
    ).toBe(false);
  });

  it("narrows where a walking player can be by how long they have walked", () => {
    const path: Cell[] = Array.from({ length: 20 }, (_, i) => [38, 80 - i] as Cell);
    const reached = cellsReached(path, 1);
    expect(reached[0][1]).toBeGreaterThanOrEqual(80 - 6);
    expect(reached.some((c) => cellDistance(c, [38, 75]) === 0)).toBe(true);
    expect(cellsReached(path, 100).at(-1)).toEqual(path.at(-1));
  });
});
