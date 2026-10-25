// Small shared numbers: easing and blending, the same everywhere they are used.

/** 0 below `a`, 1 above `b`, an S-curve between (b may be less than a, for a falling edge). */
export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
