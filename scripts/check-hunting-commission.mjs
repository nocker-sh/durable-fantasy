import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"
import { createCharacter } from "#resources/scripts/lib/create-character"
import { waitReady } from "#resources/scripts/lib/wait-ready"

const output = "/tmp/product-test/visual/solo-hunting/commission"
await mkdir(output, { recursive: true })
process.env.BASE ??= "https://durable-fantasy.localhost/?time=21:00"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
const errors = []
page.on("pageerror", (error) => errors.push(error.message))
try {
  await createCharacter(page)
  await page.evaluate(async () => {
    const response = await fetch("/api/player/hunting-fixture", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ level: 12, build: "sword" }) })
    if (!response.ok) throw Error("Fixture refused")
    // Explicit test inputs. Their acquisition is checked in ordinary battle and dependency tests.
    for (const [item, count] of [
      ["hardened-scrap", 4],
      ["charcoal", 2],
    ]) {
      const given = await fetch("/api/player/give", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: game.debugInfo().playerId, item, count }) })
      if (!given.ok) throw Error("Fixture material grant refused")
    }
  })
  await page.reload()
  await waitReady(page)
  const before = await page.evaluate(async () => {
    const player = game.state.get().player
    if (!(await game.run({ type: "unequip", slot: "weapon" }))) throw Error("Could not hand over the old weapon")
    const resident = game.scene.residents().find((entry) => entry.name === "アルノルト")
    if (!resident) throw Error("Smith not at work")
    game.talkTo(resident.id)
    return { gold: player.gold, level: player.level }
  })
  await page.waitForFunction(() => game.state.get().dialogue?.name === "アルノルト", null, { timeout: 120000 })
  await page.evaluate(() => {
    const pages = game.state.get().dialogue.pages.length
    for (let index = 0; index <= pages; index++) game.advanceDialogue()
    const choice = game.state.get().dialogue.choices.findIndex((entry) => entry.action === "commission")
    if (choice < 0) throw Error("No commission choice")
    game.choose(choice)
  })
  await page.waitForFunction(() => game.state.get().commission === "アルノルト")
  const row = page.getByRole("listitem").filter({ has: page.getByText("補強した鉄の剣", { exact: true }) })
  await row.getByRole("button", { name: "頼む", exact: true }).click()
  await page.waitForFunction(() => game.state.get().player.orders.some((order) => order.commission === "hunting-reinforced-sword"))
  const ordered = await page.evaluate(() => ({ gold: game.state.get().player.gold, orders: game.state.get().player.orders, bag: game.state.get().player.bag }))
  if (ordered.gold >= before.gold) throw Error("No commission payment")
  if (ordered.bag.some((slot) => slot?.item === "iron-sword" || slot?.item === "hardened-scrap")) throw Error("Commission did not consume its materials")
  console.log(
    "ordered with real payment; waiting for craftsman",
    ordered.orders.map((order) => ({ commission: order.commission, seconds: Math.ceil((order.readyAt - Date.now()) / 1000) })),
  )
  await page.screenshot({ path: `${output}/ordered.png` })
  await page.waitForFunction(() => game.state.get().player.orders.some((order) => order.commission === "hunting-reinforced-sword" && order.readyAt <= Date.now()), null, { timeout: 200000 })
  await page.getByRole("button", { name: "受け取る", exact: true }).click()
  await page.waitForFunction(() => game.state.get().player.bag.some((slot) => slot?.item === "reinforced-sword"))
  await page.screenshot({ path: `${output}/collected.png` })
  const made = await page.evaluate(async () => {
    game.closeCommission()
    const slot = game.state.get().player.bag.findIndex((entry) => entry?.item === "reinforced-sword")
    const item = game.state.get().player.bag[slot]
    if (!(await game.run({ type: "equip", slot }))) throw Error("Could not equip the finished sword")
    return { item, equipment: game.state.get().player.equipment, worn: game.state.get().player.worn, gold: game.state.get().player.gold }
  })
  if (made.item.by !== "アルノルト") throw Error("Missing craftsman provenance")
  await page.reload()
  await waitReady(page)
  const restored = await page.evaluate(() => ({ equipment: game.state.get().player.equipment, worn: game.state.get().player.worn, gold: game.state.get().player.gold }))
  for (const key of ["equipment", "worn", "gold"]) if (JSON.stringify(restored[key]) !== JSON.stringify(made[key])) throw Error("Commission save mismatch: " + key)
  if (errors.length) throw Error(errors.join("\n"))
  await writeFile(`${output}/result.json`, JSON.stringify({ fixture: "level 12 sword and explicit materials; no claimed ordinary acquisition", before, ordered, made, restored }, null, 2))
  console.log(JSON.stringify({ passed: true, item: made.item.item, maker: made.item.by, quality: made.item.q, gold: made.gold }))
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png` }).catch(() => {})
  await writeFile(`${output}/failure.json`, JSON.stringify({ message: String(error), errors }, null, 2))
  throw error
} finally {
  await browser.close()
}
