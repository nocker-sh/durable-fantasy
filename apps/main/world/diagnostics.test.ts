import { expect, it, vi } from "vitest"
import { diagnosticGlobal } from "#/world/diagnostics"
import { lapStart } from "#/world/lap-start"
import { lap } from "#/world/lap"
import { lapEnd } from "#/world/lap-end"
import { exposeScene } from "#/world/expose-scene"

it("shares one load timer across split operations and keeps the existing dev-only inspection points", () => {
  const hadLaps = Object.hasOwn(diagnosticGlobal, "__laps")
  const hadScene = Object.hasOwn(diagnosticGlobal, "__scene")
  const previousLaps = diagnosticGlobal.__laps
  const previousScene = diagnosticGlobal.__scene
  const clock = vi.spyOn(performance, "now").mockReturnValueOnce(100).mockReturnValueOnce(130).mockReturnValueOnce(150)
  const table = vi.spyOn(console, "table").mockImplementation(() => {})
  try {
    diagnosticGlobal.__laps = []
    lapStart("map")
    lap("build")
    lapEnd("done")
    expect(diagnosticGlobal.__laps).toEqual([
      [
        { step: "map (page open 100 ms)", at: 0, took: 0 },
        { step: "build", at: 30, took: 30 },
        { step: "done", at: 50, took: 20 },
      ],
    ])
    vi.stubEnv("DEV", true)
    const scene = { marker: "shared" }
    exposeScene(scene)
    expect(diagnosticGlobal.__scene).toBe(scene)
    vi.stubEnv("DEV", false)
    exposeScene({ marker: "hidden" })
    expect(diagnosticGlobal.__scene).toBe(scene)
  } finally {
    clock.mockRestore()
    table.mockRestore()
    vi.unstubAllEnvs()
    if (hadLaps) diagnosticGlobal.__laps = previousLaps
    else delete diagnosticGlobal.__laps
    if (hadScene) diagnosticGlobal.__scene = previousScene
    else delete diagnosticGlobal.__scene
  }
})
