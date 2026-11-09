/** Dev only: reset this browser's character on the server and forget its drafts and window layout. */
export async function resetSave(): Promise<void> {
  const response = await fetch("/api/player/reset", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
  // 404: this browser has no character yet, so only the local leftovers need clearing.
  if (!response.ok && response.status !== 404) throw new Error(await response.text())
  for (const key of Object.keys(localStorage)) {
    if (key === "durable-fantasy/player" || key === "durable-fantasy/session-proof") continue
    if (key.startsWith("durable-fantasy/") || key.startsWith("ui-")) localStorage.removeItem(key)
  }
}
