import { describe, expect, it } from "vitest";
import { HOUSES } from "./houses.ts";
import { houseStyle, lookKey, neighbours, wallsFor } from "./style.ts";

describe("each building looks like the life in it (town.md「家の見た目」)", () => {
  it("no two neighbours look the same: roof shape, walls, roof colour and windows together", () => {
    for (const h of HOUSES) for (const o of neighbours(h)) expect(lookKey(houseStyle(o)), `${h.name} / ${o.name}`).not.toBe(lookKey(houseStyle(h)));
  });

  it("walls follow the trade: stone for the smith, armourer, crystal seller, warehouse and tavern cellar; boards for those who work wood and the farm", () => {
    const wall = (id: string) => houseStyle(HOUSES.find((h) => h.id === id)!).wall;
    for (const id of ["smithy", "armorer", "crystal", "warehouse", "tavern"]) expect(wall(id), id).toBe("stone");
    for (const id of ["h6", "woodworker", "barn", "farmhouse", "h7"]) expect(wall(id), id).toBe("board");
    for (const h of HOUSES) expect(wallsFor(h), h.name).toContain(houseStyle(h).wall);
  });

  it("a barn has no chimney, a home its hearth's, and the roof keeps the table's material", () => {
    for (const h of HOUSES) {
      const st = houseStyle(h);
      if (!h.plan.hearth) expect(st.chimneys, h.name).toBe(0);
      else expect(st.chimneys, h.name).toBeGreaterThan(0);
      expect(st.roofRamp.startsWith(h.roof === "roof" || h.roof === "roof2" ? "roof" : h.roof), h.name).toBe(true);
      // an upper floor only overhangs on a timber frame
      if (st.jetty) expect(st.wall, h.name).toBe("timber");
    }
  });

  it("the town has every kind of roof and wall", () => {
    const all = HOUSES.map(houseStyle);
    for (const k of ["gable", "hip", "shed"])
      expect(
        all.some((s) => s.roofShape === k),
        k,
      ).toBe(true);
    for (const k of ["plaster", "timber", "stone", "board"])
      expect(
        all.some((s) => s.wall === k),
        k,
      ).toBe(true);
  });
});
