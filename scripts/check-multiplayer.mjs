// Two independent browser identities on the real local server. Town/channel joining and party
// requests use the game's normal client methods; creation and chat use browser controls.
// Crossing hometowns uses the development server exception; this does not test thread permissions.
import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
const errors = []
let pages = []
try {
  const contexts = await Promise.all([browser.newContext({ ignoreHTTPSErrors: true }), browser.newContext({ ignoreHTTPSErrors: true })])
  pages = await Promise.all(contexts.map((context) => context.newPage()))
  const ready = (page) => page.waitForFunction(() => window.game?.state.get().online === "online" && game.state.get().loading === null, null, { timeout: 180000 })
  for (const [i, page] of pages.entries()) {
    page.on("pageerror", (e) => errors.push(e.message))
    page.on("requestfailed", (request) => {
      if (request.resourceType() === "script") console.log("script request failed", new URL(request.url()).pathname, request.failure()?.errorText)
    })
    page.on("response", (response) => {
      if (response.request().resourceType() === "script" && response.status() >= 400) console.log("script response failed", response.status(), new URL(response.url()).pathname)
    })
    await page.goto(process.env.BASE ?? "https://durable-fantasy.localhost")
    await page.waitForFunction(() => window.game?.state.get().failed || window.game?.state.get().player, null, { timeout: 180000 })
    const failure = await page.evaluate(() => game.state.get().failed)
    if (failure) throw Error(`Player ${i + 1} failed to start; see local diagnostics`)
    await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ timeout: 180000 })
    await ready(page)
    await page.getByRole("textbox", { name: "名前", exact: true }).fill(i ? "フリッツ" : "エルナ")
    await page.getByRole("button", { name: "はじめる" }).click()
    await page.getByRole("button", { name: "町を歩く", exact: true }).click()
    console.log(`player ${i + 1} created`)
  }
  const [host, guest] = pages
  const room = await host.evaluate(() => game.state.get().room)
  await guest.evaluate((world) => game.visitTown(world), room.world)
  await ready(guest)
  await guest.evaluate((channel) => game.changeChannel(channel), room.channel)
  await ready(guest)
  await host.waitForFunction(() => game.state.get().players.some((p) => p.name === "フリッツ"))
  await guest.waitForFunction(() => game.state.get().players.some((p) => p.name === "エルナ"))
  await host.keyboard.press("Enter")
  await host.locator("input").filter({ visible: true }).last().fill("一緒に町を歩こう")
  await host.keyboard.press("Enter")
  await guest.waitForFunction(() => game.state.get().chat.some((line) => line.text === "一緒に町を歩こう"))
  console.log("mutual presence and chat delivery passed")
  const inventories = await Promise.all(
    pages.map((page) => page.evaluate(() => ({ gold: game.state.get().player.gold, bread: game.state.get().player.bag.reduce((n, s) => n + (s?.item === "rye-bread" ? s.count : 0), 0) }))),
  )
  await host.evaluate(() => game.askTrade(game.state.get().players.find((p) => p.name === "フリッツ").id))
  await guest.waitForFunction(() => game.state.get().tradeAsk !== null)
  await guest.evaluate(() => game.answerTrade(true))
  await Promise.all(pages.map((page) => page.waitForFunction(() => game.state.get().trade !== null)))
  await host.evaluate(() => game.offerTrade([{ slot: game.state.get().player.bag.findIndex((s) => s?.item === "rye-bread"), count: 1 }], 10))
  await guest.evaluate(() => game.offerTrade([], 3))
  await host.waitForFunction(() => game.state.get().trade?.mine.gold === 10 && game.state.get().trade?.theirs.gold === 3)
  await guest.waitForFunction(() => game.state.get().trade?.theirs.stacks.some((s) => s.item === "rye-bread" && s.count === 1))
  await Promise.all(pages.map((page) => page.evaluate(() => game.lockTrade())))
  await Promise.all(pages.map((page) => page.waitForFunction(() => game.state.get().trade?.mine.locked && game.state.get().trade?.theirs.locked)))
  await mkdir("public/tmp", { recursive: true })
  await host.screenshot({ path: "public/tmp/multiplayer-trade.png" })
  await Promise.all(
    pages.map((page) =>
      page.evaluate(() => {
        game.goTrade()
        game.goTrade()
      }),
    ),
  )
  for (const [i, page] of pages.entries()) {
    const expected = { gold: inventories[i].gold + (i ? 7 : -7), bread: inventories[i].bread + (i ? 1 : -1) }
    const exchanged = (expected) => {
      const s = game.state.get()
      return s.trade === null && s.player.gold === expected.gold && s.player.bag.reduce((n, item) => n + (item?.item === "rye-bread" ? item.count : 0), 0) === expected.bread
    }
    await page.waitForFunction(exchanged, expected)
    await page.reload()
    await ready(page)
    await page.waitForFunction(exchanged, expected)
  }
  console.log("trade exchanged one bread and net seven gold, persisted after reload")
  await guest.evaluate((world) => game.visitTown(world), room.world)
  await ready(guest)
  await guest.evaluate((channel) => game.changeChannel(channel), room.channel)
  await ready(guest)
  await host.waitForFunction(() => game.state.get().players.some((p) => p.name === "フリッツ"))
  await guest.waitForFunction(() => game.state.get().players.some((p) => p.name === "エルナ"))
  await host.evaluate(() => game.inviteParty(game.state.get().players.find((p) => p.name === "フリッツ").id))
  await guest.waitForFunction(() => game.state.get().partyAsk !== null)
  await guest.evaluate(() => game.answerParty(true))
  await host.waitForFunction(() => game.state.get().party?.members.length === 2)
  await guest.waitForFunction(() => game.state.get().party?.members.length === 2)
  const parties = await Promise.all(
    pages.map((page) =>
      page.evaluate(() => ({
        id: game.state.get().player.party,
        names: game.state
          .get()
          .party.members.map((m) => m.name)
          .sort(),
      })),
    ),
  )
  if (!parties[0].id || parties[0].id !== parties[1].id) throw Error("Players joined different parties")
  for (const party of parties) if (JSON.stringify(party.names) !== JSON.stringify(["エルナ", "フリッツ"])) throw Error("Party membership differs")
  console.log("party invitation and acceptance passed")
  await guest.evaluate(() => game.leaveParty())
  await guest.waitForFunction(() => game.state.get().party === null)
  await contexts[1].close()
  await host.waitForFunction(() => !game.state.get().players.some((p) => p.name === "フリッツ"))
  console.log("disconnect removed the remote player")
  if (errors.length) throw Error(errors.join("\n"))
} catch (error) {
  await mkdir("public/tmp", { recursive: true })
  for (const [i, page] of pages.entries()) {
    if (page.isClosed()) continue
    await page.screenshot({ path: `public/tmp/multiplayer-failure-${i + 1}.png` }).catch(() => {})
    const state = await page
      .evaluate(() => {
        const s = window.game?.state.get()
        return { online: s?.online, loading: s?.loading, failed: s?.failed, failureMessage: s?.failureMessage, map: s?.map.id }
      })
      .catch(() => null)
    await writeFile(`public/tmp/multiplayer-failure-${i + 1}.json`, JSON.stringify({ state, errors }, null, 2))
  }
  throw error
} finally {
  await browser.close()
}
