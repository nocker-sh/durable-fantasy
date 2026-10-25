import { qrot } from "../../../lib/engine/quaternion.ts";
import type { Bone } from "../rig";
import type { BodyContext } from "./context.ts";
import type { ClothesContext } from "./clothes.ts";
import { type V3, norm, sub, add, mul, lerp3, dot } from "../../../lib/graphics/ray/vector.ts";
import { limbSd } from "../../../lib/graphics/ray/distance.ts";

function buildArms(context: BodyContext & ClothesContext) {
  const { J, L, fem, top, S, skin, push, collar, K } = context;
  // ---- arms (the character's left is +X)
  const hands: Record<string, { p: V3; dir: V3; up: V3 }> = {};
  for (const s of ["l", "r"] as const) {
    const sh = J[`upperarm_${s}` as Bone],
      elbow = J[`lowerarm_${s}` as Bone],
      hand = J[`hand_${s}` as Bone];
    const dirFo = norm(sub(hand, elbow));
    const sleeve = L.jacket ?? (fem && L.bodice ? "cLinen" : top);
    // shoulder -> elbow -> wrist -> palm -> fingertips, one surface; the hand is its skin-coloured end
    // the sleeve widens a little toward the wrist, like a loose shirt sleeve
    const am = limbSd([sh, elbow, hand, add(hand, mul(dirFo, 0.045 * S)), add(hand, mul(dirFo, 0.085 * S))], [0.046 * S, 0.045 * S, 0.042 * S, 0.061 * S, 0.046 * S]);
    const handM = L.gloves ?? skin;
    push({
      kind: "sdf",
      a: am.c,
      b: am.c,
      r: am.r,
      r2: 0,
      sd: (p) => am.sd(p),
      m: (p) => {
        const h = { i: 0 };
        am.sd(p, h);
        return h.i >= 2 ? [handM, 0.05] : [sleeve, 0];
      },
    });
    const cuffR = L.trim ?? (collar && collar !== sleeve ? collar : "cLinen");
    // turned-back cuff at the wrist
    const cf = limbSd([lerp3(elbow, hand, 0.68), lerp3(elbow, hand, 0.98)], [0.057 * S, 0.062 * S]);
    push({ kind: "sdf", a: cf.c, b: cf.c, r: cf.r, r2: 0, sd: (p) => cf.sd(p), m: () => [cuffR, 0.05] });
    // grip axis: forward through the fist in the T-pose (thumb side)
    const grip = norm(qrot(K.q[`hand_${s}` as Bone], [0, 0, 1]));
    hands[s === "l" ? "L" : "R"] = { p: add(hand, mul(dirFo, 0.05)), dir: dirFo, up: grip };
  }
  if (L.armor) {
    // pauldrons: two overlapping lames capping each shoulder
    for (const s of ["l", "r"] as const) {
      const sh = J[`upperarm_${s}` as Bone],
        out = norm(sub(sh, J.spine_03));
      for (const [k, dy] of [
        [0, 0.012],
        [1, -0.03],
      ] as const) {
        const c0 = add(add(sh, mul(out, 0.008 + k * 0.012)), [0, dy * S, 0]);
        push({ kind: "sph", a: c0, b: c0, r: (0.068 - k * 0.006) * S, r2: 0, sy: 0.62, m: (p, n, l) => [L.armor!, (k ? -0.12 : 0.05) + (dot(n, l) > 0.7 ? 0.25 : 0)] });
      }
    }
  }
  return { hands };
}

type ArmsContext = ReturnType<typeof buildArms>;

export { buildArms, type ArmsContext };
