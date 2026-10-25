export const TIMES_OF_DAY = ["昼", "夕方", "夜"] as const;

/**
 * A soft blur at the edges of the screen, in an ellipse that follows the screen's shape: the wide
 * middle stays sharp and the blur eases in towards the rim. Blurred at the low render resolution,
 * so the pixel upscale stays nearest-neighbour. Tweak from the debug panel.
 */
export const diorama = {
  enabled: true,
  /** where the blur starts, as a fraction of the way from the centre to the edge */
  start: 0.78,
  /** how much further out it reaches full strength */
  falloff: 0.5,
  /** blur radius at full strength, in screen pixels */
  strength: 6,
  saturation: 1.05,
  contrast: 1.03,
};
