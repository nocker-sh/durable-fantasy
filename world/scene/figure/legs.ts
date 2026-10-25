import type { Bone } from "../rig";
import type { BodyContext } from "./context.ts";
import { lerp3, type V3, add, sub, norm, mul } from "../../../lib/graphics/ray/vector.ts";
import { type SurfaceMaterial, solid } from "../../../lib/graphics/ray/primitives.ts";
import { limbSd } from "../../../lib/graphics/ray/distance.ts";

function buildLegs(context: BodyContext) {
  const { J, foot_, fem, push, fold, legRamp, legs, S, L, shoes, along } = context;
  for (const s of ["l", "r"] as const) {
    const hp = J[`thigh_${s}` as Bone],
      knee = J[`calf_${s}` as Bone],
      foot = J[`foot_${s}` as Bone],
      ball = J[`ball_${s}` as Bone];
    const shin = (t: number) => lerp3(knee, foot, t);
    const bootTop = shin(foot_ === "boots" ? (fem ? 0.4 : 0.3) : 0.8);
    const limb = (pts: V3[], rs: number[], m: SurfaceMaterial) => {
      const l = limbSd(pts, rs);
      push({ kind: "sdf", a: l.c, b: l.c, r: l.r, r2: 0, sd: (p) => l.sd(p), m });
    };
    if (!fem || fold > 0.4) {
      const pm = solid(fem ? "cLinen" : legRamp);
      if (legs === "breeches") {
        // knee breeches gathered under the knee, stockings below
        limb([hp, knee, shin(0.12)], [0.064 * S, 0.062 * S, 0.056 * S], pm);
        limb([shin(0.1), foot], [0.042 * S, 0.038 * S], solid(L.hose ?? "cCream", -0.05));
      } else if (legs === "straight" || foot_ !== "boots") {
        // straight trousers to the ankle
        limb([hp, knee, shin(foot_ === "boots" ? 0.5 : 0.82)], [0.06 * S, 0.055 * S, 0.054 * S], pm);
      } else {
        // loose trousers: full at the thigh, ballooning again where they tuck into the boot
        limb([hp, knee, lerp3(bootTop, foot, 0.25)], [0.062 * S, 0.056 * S, 0.06 * S], pm);
      }
    } else {
      // stockings between the skirt hem and the shoe
      const from = L.skirt === "short" || L.skirt === "mid" ? [lerp3(hp, knee, 0.45), knee] : [shin(0.1)];
      limb([...from, foot_ === "boots" ? bootTop : foot], [...from.map(() => 0.044 * S), 0.037 * S], solid(L.hose ?? L.bottom ?? "cLinen", -0.05));
    }
    if (foot_ === "boots") {
      // boot shaft with a turned-down cuff
      limb([bootTop, foot], [0.056 * S, 0.062 * S], solid(shoes, -0.05));
      limb([add(bootTop, [0, 0.008 * S, 0]), lerp3(bootTop, foot, 0.3)], [0.082 * S, 0.078 * S], solid(shoes, 0.3));
    } else if (foot_ === "wraps") {
      // cloth strips wound round the shin, crossing bands
      const wr = limbSd([shin(0.35), foot], [0.05 * S, 0.052 * S]);
      push({
        kind: "sdf",
        a: wr.c,
        b: wr.c,
        r: wr.r,
        r2: 0,
        sd: (p) => wr.sd(p),
        m: (p) => {
          const t = along(p, shin(0.35), foot),
            lp = sub(p, foot);
          return ["cLinen", Math.sin(t * 34 + Math.atan2(lp[0], lp[2]) * 1.2) > 0.3 ? -0.3 : 0];
        },
      });
    }
    // shoe: a flattened capsule from heel to toe (clogs: a rounder wooden block)
    const fw = norm(sub(ball, foot));
    const heel = add(foot, mul(fw, -0.02 * S)),
      toe = add(ball, mul(fw, (foot_ === "clogs" ? 0.075 : 0.065) * S));
    const sr = foot_ === "shoes" || foot_ === "wraps" ? 0.068 : 0.078;
    push({ kind: "cap", a: [heel[0], heel[1] - 0.004, heel[2]], b: toe, r: sr * S, r2: 0, m: foot_ === "clogs" ? (p, n) => ["wood", n[1] > 0.5 ? 0.15 : 0] : solid(shoes, -0.1) });
  }
}

export { buildLegs };
