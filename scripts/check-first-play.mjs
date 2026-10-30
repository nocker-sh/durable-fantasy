// Fresh browser: creation draft, saved character, basic UI, chat, resume and exit.
import { chromium } from "playwright-core"
import { mkdir } from "node:fs/promises"
let page
const refusals = []
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
try {
  page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  page.on("websocket", (socket) => {
    socket.on("framereceived", ({ payload }) => {
      try {
        const message = JSON.parse(String(payload))
        if (message.type === "refused") refusals.push({ what: message.what, reason: message.reason, at: message.at })
      } catch {
        // Non-JSON frames carry no game command diagnostics.
      }
    })
  })
  await page.goto(process.env.BASE ?? "https://durable-fantasy.localhost")
  await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ timeout: 180000 })
  await page.waitForFunction(() => window.game?.state.get().loading === null, null, { timeout: 180000 })
  for (const key of ["Tab", "Shift+Tab"].flatMap((key) => Array.from({ length: 30 }, () => key))) {
    await page.keyboard.press(key)
    if (!(await page.evaluate(() => !!document.activeElement?.closest(".character-creation")))) throw Error("Keyboard focus escaped character creation")
  }
  if (!(await page.getByRole("button", { name: "はじめる" }).isDisabled())) throw Error("Blank name accepted")
  await page.getByRole("textbox", { name: "名前", exact: true }).fill("エルナ")
  await page.getByRole("button", { name: "次の姿", exact: true }).click()
  await page.getByRole("button", { name: "スカーフ", exact: true }).click()
  await page.getByRole("button", { name: "水色", exact: true }).click()
  await page.reload()
  await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ timeout: 180000 })
  if ((await page.getByRole("textbox", { name: "名前", exact: true }).inputValue()) !== "エルナ") throw Error("Creation draft lost")
  if (
    (await page.getByRole("button", { name: "スカーフ", exact: true }).getAttribute("aria-pressed")) !== "true" ||
    (await page.getByRole("button", { name: "水色", exact: true }).getAttribute("aria-pressed")) !== "true"
  )
    throw Error("Creation selection draft lost")
  await page.getByRole("button", { name: "はじめる" }).click()
  await page.waitForFunction(() => window.game?.state.get().player?.profileComplete === true)
  await page.getByRole("dialog", { name: "操作", exact: true }).waitFor()
  await mkdir("public/tmp", { recursive: true })
  await page.screenshot({ path: "public/tmp/first-play-welcome.png" })
  await page.getByRole("button", { name: "町を歩く", exact: true }).click()
  const before = await page.evaluate(() => game.scene.playerCell())
  await page.keyboard.down("ArrowRight")
  try {
    await page.waitForFunction((at) => game.scene.playerCell().some((v, i) => v !== at[i]), before)
  } finally {
    await page.keyboard.up("ArrowRight")
  }
  await page.waitForFunction(() => !game.scene.player().walking)
  console.log("walked")
  await page.evaluate(() => {
    const at = game.scene.player()
    const residents = game.scene.residents().sort((a, b) => Math.hypot(a.x - at.x, a.z - at.z) - Math.hypot(b.x - at.x, b.z - at.z))
    if (!residents.length) throw Error("No residents to speak with")
    game.scene.approach(residents[0].id)
  })
  await page.waitForFunction(() => game.state.get().dialogue !== null, null, { timeout: 60000 })
  console.log("resident conversation opened")
  await page.keyboard.press("Escape")
  console.log("saved", await page.evaluate(() => ({ name: game.state.get().player.name, online: game.state.get().online })))
  await page.keyboard.press("i")
  await page.getByText("持ち物", { exact: true }).first().waitFor()
  await page.keyboard.press("Escape")
  await page.keyboard.press("Enter")
  await page.locator("input").filter({ visible: true }).last().fill("こんにちは")
  await page.keyboard.press("Enter")
  await page.waitForFunction(() => game.state.get().chat.some((line) => line.text === "こんにちは"))
  await page.reload()
  await page.waitForFunction(() => window.game?.state.get().player?.profileComplete === true && window.game?.state.get().loading === null, null, { timeout: 180000 })
  const restored = await page.evaluate(() => game.state.get().player)
  if (restored.name !== "エルナ" || restored.look !== 1 || restored.neck !== "scarf" || restored.neckRamp !== "cSky") throw Error("Saved character differs")
  if (await page.getByRole("dialog", { name: "操作", exact: true }).count()) throw Error("Welcome repeated on resume")
  console.log("restored", await page.evaluate(() => ({ name: game.state.get().player.name, online: game.state.get().online })))
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "ゲームを閉じる", exact: true }).click()
  await page.getByRole("button", { name: "町に戻る", exact: true }).waitFor()
  console.log("left successfully")
  if (errors.length) throw Error(errors.join("\n"))
} catch (error) {
  console.error("first-play failure", {
    refusals,
    state: await page
      ?.evaluate(() => ({
        player: window.game?.scene?.player(),
        online: window.game?.state.get().online,
        profileComplete: window.game?.state.get().player?.profileComplete,
        dialogue: window.game?.state.get().dialogue?.name,
      }))
      .catch(() => null),
  })
  throw error
} finally {
  await browser.close()
}
