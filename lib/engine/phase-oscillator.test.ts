import { expect, it } from "vitest"
import { PhaseOscillator } from "#/lib/engine/phase-oscillator"

it("matches independent waves across all ash phases and clock jumps", () => {
  for (const step of [1, 1.7]) {
    const waves = new PhaseOscillator(1600, step)
    for (const t of [0, 0.2, 100, 10000, -12]) {
      waves.setTime(t)
      for (let i = 0; i < 1600; i++) {
        expect(waves.sin(i)).toBeCloseTo(Math.sin(t + i * step), 10)
        expect(waves.cos(i)).toBeCloseTo(Math.cos(t + i * step), 10)
      }
    }
  }
})
