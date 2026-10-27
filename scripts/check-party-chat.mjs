// Three independent identities: party speech crosses maps but never reaches bystanders.
import { chromium } from "playwright-core"
import { mkdir } from "node:fs/promises"
import { createCharacter, waitReady, walkToMap } from "./lib/game-browser.mjs"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
const errors = []
const failedScripts = []
const withDeadline = async (promise) => {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((resolve) => {
        timer = setTimeout(() => resolve({ diagnosticsTimedOut: true }), 5000)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}
const pages = []
try {
  for (const name of ["エルナ", "フリッツ", "オットー"]) {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
    const page = await context.newPage()
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("response", (response) => {
      if (response.request().resourceType() === "script" && response.status() >= 400) failedScripts.push({ name, path: new URL(response.url()).pathname, status: response.status() })
    })
    page.on("requestfailed", (request) => {
      if (request.resourceType() === "script") failedScripts.push({ name, path: new URL(request.url()).pathname, failed: true })
    })
    await createCharacter(page, name)
    pages.push(page)
  }
  const [host, guest, outsider] = pages
  const room = await host.evaluate(() => game.state.get().room)
  for (const page of [guest, outsider]) {
    await page.evaluate((world) => game.visitTown(world), room.world)
    await waitReady(page)
    await page.evaluate((channel) => game.changeChannel(channel), room.channel)
    await waitReady(page)
  }
  const invite = async (page, name) => {
    await host.waitForFunction((name) => game.state.get().players.some((player) => player.name === name), name)
    await host.evaluate((name) => game.inviteParty(game.state.get().players.find((player) => player.name === name).id), name)
    await page.waitForFunction(() => game.state.get().partyAsk !== null)
    await page.evaluate(() => game.answerParty(true))
    await page.waitForFunction(() => game.state.get().player.party !== null)
  }
  const say = async (page, text) => {
    await page.keyboard.press("Enter")
    await page.locator("input").filter({ visible: true }).last().fill(`/p ${text}`)
    await page.keyboard.press("Enter")
  }
  const received = (page, text) => page.waitForFunction((text) => game.state.get().chat.some((line) => line.channel === "party" && line.text === text), text, { timeout: 20000 })
  const absent = async (page, text) => {
    if (await page.evaluate((text) => game.state.get().chat.some((line) => line.text === text), text)) throw Error("Private speech reached an unauthorized recipient")
  }
  await invite(guest, "フリッツ")
  await walkToMap(guest, "phanthiet-gate")
  await say(host, "南門で待ち合わせ")
  await received(guest, "南門で待ち合わせ")
  await received(host, "南門で待ち合わせ")
  await absent(outsider, "南門で待ち合わせ")
  console.log("party chat crossed maps without public delivery")
  await invite(outsider, "オットー")
  await say(guest, "仲間が増えたね")
  await received(outsider, "仲間が増えたね")
  await absent(outsider, "南門で待ち合わせ")
  await guest.reload()
  await waitReady(guest)
  await received(guest, "南門で待ち合わせ")
  await say(host, "道中は気をつけて")
  await received(guest, "道中は気をつけて")
  const duplicates = await guest.evaluate(() => game.state.get().chat.filter((line) => line.text === "南門で待ち合わせ").length)
  if (duplicates !== 1) throw Error("Party history was duplicated")
  await mkdir("public/tmp", { recursive: true })
  await guest.screenshot({ path: "public/tmp/party-chat.png" })
  await guest.evaluate(() => game.leaveParty())
  await guest.waitForFunction(() => game.state.get().player.party === null)
  await say(host, "残った二人の話")
  await received(outsider, "残った二人の話")
  await absent(guest, "残った二人の話")
  await say(guest, "脱退後の話")
  await guest.getByText("パーティに入ってから話そう。", { exact: true }).waitFor()
  await absent(host, "脱退後の話")
  if (errors.length) throw Error(errors.join("\n"))
  console.log("join privacy, reload, deduplication and leaving passed")
} catch (error) {
  console.error("party chat check failed", error.message)
  console.error({
    failedScripts,
    errors,
    states: await Promise.all(
      pages.map((page) =>
        withDeadline(
          page
            .evaluate(() => ({
              map: window.game?.state.get().map.id,
              online: window.game?.state.get().online,
              loading: window.game?.state.get().loading,
              failed: window.game?.state.get().failed,
              failureMessage: window.game?.state.get().failureMessage,
              sceneReady: window.game?.scene?.ready,
            }))
            .catch(() => null),
        ),
      ),
    ),
  })
  throw error
} finally {
  await browser.close()
}
