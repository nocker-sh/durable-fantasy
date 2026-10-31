import { afterEach, expect, it, vi } from "vitest"
import { runLocalVp } from "#/scripts/lib/run-local-vp"

afterEach(() => vi.unstubAllEnvs())

it("starts the installed CLI without a global command on PATH", () => {
  vi.stubEnv("PATH", "")
  const command = runLocalVp({ args: ["--version"] })
  expect(command.error).toBeUndefined()
  expect(command.status).toBe(0)
  expect(command.stdout).toMatch(/vp v\d+\./)
}, 15000)
