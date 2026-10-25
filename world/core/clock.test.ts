import { describe, expect, it } from "vitest";
import { daylight, dusk, jstMinutes, parseTime, phase, within } from "./clock.ts";

describe("the clock and the light", () => {
  it("runs on Japan time", () => {
    expect(jstMinutes(Date.UTC(2026, 9, 21, 0, 0))).toBe(9 * 60);
    expect(jstMinutes(Date.UTC(2026, 9, 21, 15, 30))).toBe(30);
  });

  it("is dark until nine, light by half past ten, red at dusk and dark by six", () => {
    expect(daylight(parseTime("03:00")!)).toBe(0);
    expect(daylight(parseTime("09:00")!)).toBe(0);
    expect(daylight(parseTime("12:00")!)).toBe(1);
    expect(daylight(parseTime("16:30")!)).toBeGreaterThan(0.2);
    expect(daylight(parseTime("16:30")!)).toBeLessThan(0.8);
    expect(daylight(parseTime("18:00")!)).toBe(0);
    expect(dusk(parseTime("16:45")!)).toBeGreaterThan(0.8);
    expect(dusk(parseTime("12:00")!)).toBe(0);
    expect(phase(parseTime("10:00")!)).toBe("夜明け");
    expect(phase(parseTime("23:00")!)).toBe("夜");
  });

  it("knows spans that run past midnight", () => {
    expect(within(parseTime("23:00")!, parseTime("16:00")!, parseTime("07:00")!)).toBe(true);
    expect(within(parseTime("06:59")!, parseTime("16:00")!, parseTime("07:00")!)).toBe(true);
    expect(within(parseTime("12:00")!, parseTime("16:00")!, parseTime("07:00")!)).toBe(false);
  });
});
