import { getDevVisualReadiness } from "#/scripts/lib/get-dev-visual-readiness"
type Navigation = {
  goto: (url: string, options: { waitUntil: "domcontentloaded"; timeout: number }) => Promise<{ status: () => number } | null>
  waitForSelector: (selector: string, options: { timeout: number }) => Promise<unknown>
  waitForFunction: (predicate: () => boolean, argument: null, options: { timeout: number }) => Promise<unknown>
  waitForTimeout: (milliseconds: number) => Promise<void>
}
type Props = { page: Navigation; url: string; failures: ReadonlyArray<string> }
/** A failed first load is evidence: never replace it with a later successful navigation. */
export async function openDevPage(props: Props): Promise<Error | null> {
  try {
    const response = await props.page.goto(props.url, { waitUntil: "domcontentloaded", timeout: 15000 })
    if (!response || response.status() >= 400) return new Error(`Dev page navigation failed: ${response?.status() ?? "no response"}`)
    const deadline = Date.now() + 15000
    await props.page.waitForSelector('body[data-ready="1"]', { timeout: 15000 })
    await props.page.waitForTimeout(300)
    await props.page.waitForFunction(getDevVisualReadiness, null, { timeout: Math.max(1, deadline - Date.now()) })
    if (props.failures.length) return new Error(`Dev page load failed: ${props.failures.join("; ")}`)
    return null
  } catch (error) {
    return new Error(`Dev page did not become ready: ${error instanceof Error ? error.message : String(error)}; ${props.failures.join("; ")}`, { cause: error })
  }
}
