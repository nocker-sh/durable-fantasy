import { waitReady } from "#resources/scripts/lib/wait-ready"

export async function createCharacter(page, name = "ペトラ") {
  await page.addInitScript(() => performance.setResourceTimingBufferSize(20000))
  await page.goto(process.env.BASE ?? "https://durable-fantasy.localhost")
  await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ timeout: 180000 })
  await waitReady(page)
  await page.getByRole("textbox", { name: "名前", exact: true }).fill(name)
  await page.getByRole("button", { name: "はじめる" }).click()
  // 作成の成功後は案内を挟まずそのまま町に立つ（ui.md「キャラクター作成と退出」）。
  await page.waitForFunction(() => window.game?.state.get().player?.profileComplete === true)
  await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ state: "hidden" })
  await waitReady(page)
}
