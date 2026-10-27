// Browser checks use normal client movement; no position or inventory overrides.
export const waitReady = (page) => page.waitForFunction(() => window.game?.scene?.ready && game.state.get().loading === null && game.state.get().online === "online", null, { timeout: 180000 })

export async function createCharacter(page) {
  await page.goto(process.env.BASE ?? "https://durable-fantasy.localhost")
  await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ timeout: 180000 })
  await waitReady(page)
  await page.getByRole("textbox", { name: "名前", exact: true }).fill("エルナ")
  await page.getByRole("button", { name: "この姿で始める" }).click()
  await page.getByRole("button", { name: "町を歩く", exact: true }).click()
  await waitReady(page)
}

export async function walkToMap(page, destination) {
  const route = await page.evaluate(async (destination) => {
    const { MAPS } = await import("/world/maps/index.ts")
    const start = game.state.get().map.id
    const queue = [[start]]
    const seen = new Set([start])
    while (queue.length) {
      const path = queue.shift()
      const map = path.at(-1)
      if (map === destination) return path.slice(1)
      for (const warp of MAPS[map].warps)
        if (!seen.has(warp.to.map)) {
          seen.add(warp.to.map)
          queue.push([...path, warp.to.map])
        }
    }
    throw Error(`No route to ${destination}`)
  }, destination)
  for (const next of route) {
    await page.evaluate(async (next) => {
      const { MAPS } = await import("/world/maps/index.ts")
      const at = game.scene.playerCell()
      const exits = MAPS[game.state.get().map.id].warps.filter((w) => w.to.map === next)
      exits.sort((a, b) => Math.hypot(a.at[0] - at[0], a.at[1] - at[1]) - Math.hypot(b.at[0] - at[0], b.at[1] - at[1]))
      const cell = exits[0].at
      game.scene.walkTo((cell[0] + 0.5) / 2, (cell[1] + 0.5) / 2)
    }, next)
    await page.waitForFunction((next) => game.state.get().map.id === next, next, { timeout: 120000 })
    await waitReady(page)
    console.log("walked to", next)
  }
  return route
}

/** CPU slowdown only: this does not emulate GPU speed or available memory. */
export async function configureCpu(page) {
  const rate = Number(process.env.CPU_SLOWDOWN ?? 1)
  if (!Number.isFinite(rate) || rate < 1) throw Error("CPU_SLOWDOWN must be a finite number of at least 1")
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Emulation.setCPUThrottlingRate", { rate })
  return rate
}
