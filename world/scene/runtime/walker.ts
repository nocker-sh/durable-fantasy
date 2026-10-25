import type { V2 } from "../build";
import type { Figure } from "../actors";

/** A figure that walks cell to cell: the player and other players. */
interface Walker {
  id: string;
  name: string;
  fig: Figure;
  pos: V2;
  path: V2[];
  head: number;
  t: number;
  label: HTMLDivElement;
}

export type { Walker };
