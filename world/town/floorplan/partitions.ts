import { DIV } from "./geometry.ts";
import { type DividerKind, type Divider } from "./types.ts";

/** Split [a, b] into `n` parts with thin partitions between them; returns the parts. */
function split(a: number, b: number, n: number): [number, number][] {
  const step = (b - a - DIV * (n - 1)) / n;
  return Array.from({ length: n }, (_, k) => [a + k * (step + DIV), a + k * (step + DIV) + step]);
}

/** A partition across x at depth z (from x0 to x1), with a gap of `gap` metres centred on `gx`. */
function across(floor: number, kind: DividerKind, x0: number, x1: number, z: number, gx: number | null, gap = 1.0): Divider[] {
  const half = { floor, kind, z0: z - DIV / 2, z1: z + DIV / 2 };
  if (gx === null) return [{ ...half, x0, x1 }];
  return [
    { ...half, x0, x1: Math.max(x0, gx - gap / 2) },
    { ...half, x0: Math.min(x1, gx + gap / 2), x1 },
  ].filter((d) => d.x1 - d.x0 > 0.05);
}

/** A partition along z at x (from z0 to z1), with a gap. */
function along(floor: number, kind: DividerKind, z0: number, z1: number, x: number, gz: number | null, gap = 1.0): Divider[] {
  const half = { floor, kind, x0: x - DIV / 2, x1: x + DIV / 2 };
  if (gz === null) return [{ ...half, z0, z1 }];
  return [
    { ...half, z0, z1: Math.max(z0, gz - gap / 2) },
    { ...half, z0: Math.min(z1, gz + gap / 2), z1 },
  ].filter((d) => d.z1 - d.z0 > 0.05);
}

export { split, across, along };
