/** Layout checks wait for visible previews while offscreen objects remain available on demand. */
export function getDevVisualReadiness(): boolean {
  if (document.fonts.status !== "loaded") return false
  return [...document.querySelectorAll("[data-thumbnail-state]")].every((element) => {
    const bounds = element.getBoundingClientRect()
    if (bounds.width === 0 || bounds.height === 0 || bounds.bottom <= 0 || bounds.right <= 0 || bounds.top >= window.innerHeight || bounds.left >= window.innerWidth) return true
    const image = element.querySelector("img")
    return element.getAttribute("data-thumbnail-state") === "ready" && image !== null && image.complete && image.naturalWidth > 0
  })
}
