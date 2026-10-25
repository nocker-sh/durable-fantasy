// Public entry points; implementation lives in focused modules.
export { FRINGES, type Fringe, type Look, type Item } from "./figure/look.ts";
export { type Anim, type AnimSpec, ANIMS, FRAMES, ANIM_DUR } from "./figure/animation.ts";
export { FW, FH, OX, OY, SPPU, eyesDrawn, EYE_DARK, renderFrame } from "./figure/render.ts";
export { type Sheet, buildSheet, buildSheetStrip } from "./figure/sheets.ts";
