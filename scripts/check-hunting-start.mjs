import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"
import { MAPS } from "#/world/maps"
import { RESIDENT_WORK_SPOTS } from "#/world/maps/resident-work-spots"
import { npcCell } from "#/world/maps/npc-cell"
import { createCharacter } from "#resources/scripts/lib/create-character"
import { walkToMap } from "#resources/scripts/lib/walk-to-map"
import { waitReady } from "#resources/scripts/lib/wait-ready"
import { selectHuntingTarget } from "#/scripts/lib/select-hunting-target"

const build = process.env.HUNT_BUILD ?? "sword"
const jitter = Number(process.env.HUNT_JITTER_MS ?? 0)
if (!Number.isInteger(jitter) || jitter < 0 || jitter > 500) throw Error("Invalid first-strike jitter")
if (!["sword", "mage"].includes(build)) throw Error("Unknown starting build")
const name = build === "sword" ? "アルノルト" : "ゴットフリート"
const weapon = build === "sword" ? "short-sword" : "oak-staff"
const weaponName = build === "sword" ? "ショートソード" : "樫の杖"
const skill = build === "sword" ? "lunge" : "ember"
const workplace = RESIDENT_WORK_SPOTS.get(name)
const cell = npcCell(MAPS[workplace.map], name, 1260)
const output = `/tmp/product-test/visual/solo-hunting/start-${build}${jitter ? "-jitter" : ""}`
await mkdir(output, { recursive: true })
process.env.BASE ??= "https://durable-fantasy.localhost/?time=21:00"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
const errors = []
const combat = []
page.on("websocket", (socket) => {
  socket.on("framesent", (event) => {
    try {
      const message = JSON.parse(String(event.payload))
      if (message.type === "attack") combat.push({ direction: "sent", at: Date.now(), message })
    } catch {}
  })
  socket.on("framereceived", (event) => {
    try {
      const message = JSON.parse(String(event.payload))
      if (message.type === "result") {
        combat.push({ direction: "received", at: Date.now(), message: { type: message.type, ok: message.result.ok, events: message.result.events, reason: message.result.reason } })
      }
      if (["struck", "refused", "art", "looted"].includes(message.type)) combat.push({ direction: "received", at: Date.now(), message })
    } catch {}
  })
})
page.on("pageerror", (error) => errors.push(error.message))
try {
  await createCharacter(page)
  const before = await page.evaluate(() => ({ gold: game.state.get().player.gold, level: game.state.get().player.level, points: game.state.get().player.statPoints }))
  await page.evaluate(async (build) => {
    const requirements = build === "sword" ? [["str", 8], ["dex", 7]] : [["mnd", 7], ["int", 9]]
    for (const [stat, target] of requirements) while (game.state.get().player.stats[stat] < target) if (!(await game.run({ type: "raise", stat }))) throw Error("Starting points refused")
  }, build)
  await walkToMap(page, workplace.map)
  await page.evaluate((name) => {
    const resident = game.scene.residents().find((entry) => entry.name === name)
    if (!resident) throw Error("Craftsman not visible at work")
    game.talkTo(resident.id)
  }, name)
  await page.waitForFunction((name) => game.state.get().dialogue?.name === name, name, { timeout: 120000 })
  await page.evaluate(() => {
    const dialogue = game.state.get().dialogue
    for (let index = 0; index <= dialogue.pages.length; index++) game.advanceDialogue()
    const choice = game.state.get().dialogue.choices.findIndex((entry) => entry.action === "shop")
    if (choice < 0) throw Error("No shopping choice")
    game.choose(choice)
  })
  await page.waitForFunction(() => game.state.get().shop && game.state.get().stock !== null)
  const row = page.getByRole("listitem").filter({ hasText: weaponName })
  await row.getByRole("button", { name: "買う", exact: true }).click()
  await page.waitForFunction((weapon) => game.state.get().player.bag.some((slot) => slot?.item === weapon), weapon)
  const bought = await page.evaluate(() => ({ gold: game.state.get().player.gold, bag: game.state.get().player.bag }))
  if (!(bought.gold >= 0 && bought.gold < before.gold)) throw Error("Purchase did not use original funds")
  await page.screenshot({ path: `${output}/purchase.png` })
  await page.evaluate(async ({ weapon, skill }) => {
    game.closeShop()
    const slot = game.state.get().player.bag.findIndex((entry) => entry?.item === weapon)
    if (!(await game.run({ type: "equip", slot }))) throw Error("Purchased weapon could not be equipped")
    if (!(await game.run({ type: "hotbar", index: 3, item: "skill:" + skill }))) throw Error("Starting skill could not be bound")
    if (game.state.get().windows.includes("inventory")) game.toggleWindow("inventory")
  }, { weapon, skill })
  await walkToMap(page, "south-meadow")
  if (jitter) await page.evaluate((delay) => {
    const socket = game.session.socket
    const original = socket.send.bind(socket)
    let delayed = false
    socket.send = (message) => {
      if (!delayed && message.type === "attack" && !message.art) {
        delayed = true
        setTimeout(() => original(message), delay)
      } else original(message)
    }
  }, jitter)
  console.log("selecting first opponent")
  const target = await selectHuntingTarget(page, "blue-slime")
  console.log("selected", target, await page.evaluate(() => ({ fighting: game.session.fighting, art: game.session.art, typing: game.state.get().typing, hotbar: game.state.get().player.hotbar, focus: document.activeElement?.tagName })))
  await page.keyboard.press("4")
  console.log("skill key", await page.evaluate(() => ({ fighting: game.session.fighting, art: game.session.art, ready: game.state.get().player.ready, focus: document.activeElement?.tagName })))
  await page.waitForFunction((id) => game.state.get().player.ready[id] > 0, skill, { timeout: 15000 })
  await page.waitForFunction((id) => game.session.wild[id]?.hp === 0, target, { timeout: 60000 })
  await page.waitForFunction(() => game.state.get().player.exp > 0)
  const after = await page.evaluate(() => {
    const p = game.state.get().player
    return { hp: p.hp, gold: p.gold, exp: p.exp, level: p.level, equipment: p.equipment, bag: p.bag }
  })
  if (jitter && combat.filter((entry) => entry.direction === "sent" && entry.message.art === skill).length < 2) throw Error("Jitter did not exercise an art retry")
  if (after.hp <= 0) throw Error("Starting build fell")
  await page.screenshot({ path: `${output}/battle.png` })
  await page.reload()
  await waitReady(page)
  const restored = await page.evaluate(() => ({ gold: game.state.get().player.gold, exp: game.state.get().player.exp, equipment: game.state.get().player.equipment, bag: game.state.get().player.bag }))
  for (const key of ["gold", "exp", "equipment", "bag"]) if (JSON.stringify(restored[key]) !== JSON.stringify(after[key])) throw Error("Starting save mismatch: " + key)
  if (errors.length) throw Error(errors.join("\n"))
  await writeFile(`${output}/result.json`, JSON.stringify({ build, firstStrikeJitterMs: jitter, before, bought, after, restored, target, combat, shop: { name, map: workplace.map, cell } }, null, 2))
  console.log(JSON.stringify({ passed: true, build, gold: after.gold, exp: after.exp, hp: after.hp, weapon }))
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png` }).catch(() => {})
  await writeFile(`${output}/failure.json`, JSON.stringify({ message: String(error), errors, combat }, null, 2))
  throw error
} finally {
  await browser.close()
}
