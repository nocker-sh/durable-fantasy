import { getRuntimeModuleUrl } from "#/scripts/lib/get-runtime-module-url"

export async function readRuntimeModuleUrl(page, path) {
  const resources = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name))
  return getRuntimeModuleUrl({ path, resources })
}
