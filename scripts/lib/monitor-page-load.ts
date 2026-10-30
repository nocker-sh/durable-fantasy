import type { Page, Request, Response } from "playwright-core"
/** Capture script failures as well as HTTP errors; omit URL queries that may contain credentials. */
export function monitorPageLoad(page: Page) {
  const failures: string[] = [],
    requests = new Set<Request>()
  const request = (request: Request) => {
    requests.add(request)
  }
  const failed = (request: Request) => {
    if (requests.has(request)) failures.push(`request ${new URL(request.url()).pathname}: ${request.failure()?.errorText ?? "failed"}`)
    requests.delete(request)
  }
  const response = (response: Response) => {
    if (requests.has(response.request()) && response.status() >= 400) failures.push(`HTTP ${response.status()} ${new URL(response.url()).pathname}`)
  }
  const finished = (request: Request) => {
    requests.delete(request)
  }
  const error = (error: Error) => {
    failures.push(`page: ${error.message}`)
  }
  page.on("request", request).on("requestfailed", failed).on("response", response).on("requestfinished", finished).on("pageerror", error)
  return {
    failures,
    stop: () => {
      page.off("request", request).off("requestfailed", failed).off("response", response).off("requestfinished", finished).off("pageerror", error)
      requests.clear()
    },
  }
}
