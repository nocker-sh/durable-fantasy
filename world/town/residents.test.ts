import { describe, expect, it } from "vitest";
import { RELATIONS } from "./people.ts";
import { RESIDENTS, RESIDENT_LOOKS } from "./residents.ts";

const look = (name: string) => RESIDENT_LOOKS[RESIDENTS.findIndex((r) => r.name === name)];
/** how many of hair, eyes and skin two people have in common */
const likeness = (a: string, b: string) => (["hair", "eye", "skin"] as const).filter((k) => look(a)[k] === look(b)[k]).length;

describe("how residents look", () => {
  it("no two residents look the same", () => {
    const keys = RESIDENT_LOOKS.map((l) => JSON.stringify({ ...l, fringe: undefined }));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("children take after a parent, brothers and sisters after each other, and a grandchild has a grandparent's eyes or skin", () => {
    const parents = new Map<string, string[]>();
    for (const r of RELATIONS) if (r.kind === "親子") parents.set(r.b, [...(parents.get(r.b) ?? []), r.a]);
    for (const [child, ps] of parents) expect(Math.max(...ps.map((p) => likeness(child, p))), `${child} and ${ps.join("・")}`).toBeGreaterThanOrEqual(2);
    for (const r of RELATIONS) if (["兄妹", "姉妹", "兄弟"].includes(r.kind)) expect(likeness(r.a, r.b), `${r.a}・${r.b}`).toBeGreaterThanOrEqual(2);
    for (const r of RELATIONS)
      if (r.kind === "祖父と孫" || r.kind === "祖母と孫")
        expect(
          (["eye", "skin"] as const).some((k) => look(r.a)[k] === look(r.b)[k]),
          `${r.a}・${r.b}`,
        ).toBe(true);
  });

  it("the old have grey hair (or none), only the old, and the watch on duty wear iron", () => {
    for (const [i, r] of RESIDENTS.entries()) {
      const l = RESIDENT_LOOKS[i];
      if (l.age === "old") expect(l.hair === "hGray" || l.style === "bald", r.name).toBe(true);
      else expect(l.hair, r.name).not.toBe("hGray");
      if (/^(衛兵|門番)/.test(r.job)) expect(l.armor, r.name).toBeDefined();
    }
  });

  it("everyone wraps something round the neck", () => {
    for (const [i, l] of RESIDENT_LOOKS.entries()) expect(l.neck, RESIDENTS[i].name).toBeDefined();
  });
});
