import type { Cell } from "#/world/protocol"

export function adjacentCells(first: Cell, second: Cell): boolean {
  return Math.max(Math.abs(first[0] - second[0]), Math.abs(first[1] - second[1])) <= 1
}
