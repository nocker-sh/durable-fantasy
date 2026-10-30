import { waitReady } from "#resources/scripts/lib/wait-ready"

export async function walkToMap(page, destination) {
  const route = await page.evaluate(async (destination) => {
    const { MAPS } = await import("/world/maps/index")
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
      const { MAPS } = await import("/world/maps/index")
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
