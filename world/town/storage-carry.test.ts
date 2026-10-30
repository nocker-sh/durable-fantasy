import { expect, it } from "vitest"
import { certifyStorageCarry } from "./storage-carry"
it("keeps the full carried rectangle clear even when only its corner hits", () => {
  const rect = [-0.2, 0.5, 0.2, 0.9] as const,
    poses = [
      { body_m: [1, 2] as const, turn: 0 as const },
      { body_m: [3, 2] as const, turn: 0 as const },
    ]
  expect(() => certifyStorageCarry({ relative: rect, radius: 0.3, poses: poses, width: 5, depth: 5, obstacles: [[2, 2.85, 2.1, 3]] })).toThrow("Carried object crosses")
  expect(certifyStorageCarry({ relative: rect, radius: 0.3, poses: poses, width: 5, depth: 5, obstacles: [] }).segments).toBe(1)
})
it("reserves every corner throughout a turn instead of checking the two orientations only", () => {
  const rect = [0.5, -0.1, 1, 0.1] as const,
    poses = [
      { body_m: [2, 2] as const, turn: 0 as const },
      { body_m: [2, 2] as const, turn: 1 as const },
    ]
  expect(() => certifyStorageCarry({ relative: rect, radius: 0.3, poses: poses, width: 5, depth: 5, obstacles: [[2.6, 2.6, 2.7, 2.7]] })).toThrow("Carry turn strikes")
})
