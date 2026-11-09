import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"
import { createCharacter } from "#resources/scripts/lib/create-character"
import { walkToMap } from "#resources/scripts/lib/walk-to-map"
import { readRuntimeModuleUrl } from "#resources/scripts/lib/read-runtime-module-url"

const output = "/tmp/product-test/visual/combat-position"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
try {
  await mkdir(output, { recursive: true })
  const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.setDefaultTimeout(60000)
  await createCharacter(page, "リント")
  console.log("created character")
  await page.screenshot({ path: `${output}/town.png` })
  await walkToMap(page, "south-meadow")
  console.log("entered", await page.evaluate(() => game.state.get().map.name))
  const paths = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => new URL(entry.name).pathname)
      .filter((path) => /\/monster-motion\.ts$|\/monsters\.ts$/.test(path)),
  )
  console.log("loaded modules", paths)
  const motionPath = [...new Set(paths.filter((path) => path.endsWith("/core/monster-motion.ts")))][0]
  if (!motionPath) throw Error("Running monster motion module was not loaded")
  const motionUrl = await readRuntimeModuleUrl(page, motionPath.replace(/\.ts$/, ""))
  const target = await page.evaluate(async (url) => {
    const motion = await import(url)
    const original = motion.MonsterMotion.prototype.at
    window.combatSamples = []
    motion.MonsterMotion.prototype.at = function (time) {
      const position = original.call(this, time)
      if (this.props.spawn.id === window.combatTarget) {
        const health = game.session.wild[window.combatTarget]
        if (health?.combat && health.hp > 0) window.combatSamples.push({ time, x: position.x, z: position.z, combat: health.combat, cell: game.scene.playerCell() })
      }
      return position
    }
    const candidates = Object.entries(game.session.wild).filter(([id, health]) => id.includes("-slime-") && health.hp > 0)
    if (!candidates.length) throw Error("No living slime")
    window.combatTarget = candidates[0][0]
    const before = { exp: game.state.get().player.exp, level: game.state.get().player.level }
    game.scene.fight(window.combatTarget)
    return { id: window.combatTarget, before }
  }, motionUrl)
  console.log("fighting", target.id)
  await page.waitForFunction(() => combatSamples.length >= 30, null, { timeout: 120000 })
  await page.screenshot({ path: `${output}/standing.png` })
  await page.waitForFunction(
    (before) => {
      const player = game.state.get().player
      return player.level > before.level || player.exp > before.exp || player.hp <= 0
    },
    target.before,
    { timeout: 120000 },
  )
  const result = await page.evaluate(() => ({
    samples: combatSamples,
    player: { hp: game.state.get().player.hp, exp: game.state.get().player.exp, level: game.state.get().player.level },
    health: game.session.wild[combatTarget],
  }))
  if (result.player.hp <= 0) throw Error("Fell during starting combat")
  if (result.samples.length < 30) throw Error("Insufficient rendered combat frames")
  const first = result.samples[0]
  if (result.samples.some((sample) => sample.time !== first.combat.at || sample.x !== first.x || sample.z !== first.z)) throw Error("Creature moved during combat")
  const settled = result.samples.slice(30)
  if (!settled.length || settled.some((sample) => JSON.stringify(sample.cell) !== JSON.stringify(settled[0].cell))) throw Error("Player kept pursuing during combat")
  if (result.health.combat) throw Error("Defeat retained the combat position")
  if (errors.length) throw Error(errors.join("\n"))
  await writeFile(`${output}/result.json`, JSON.stringify({ target, ...result }, null, 2))
  console.log(JSON.stringify({ passed: true, frames: result.samples.length, target: target.id, player: result.player }))
} finally {
  await browser.close()
}
