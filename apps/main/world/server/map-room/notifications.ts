/** A closed socket must not interrupt game persistence. Reconnection reloads saved state. */
export async function notifyClient(delivery: Promise<void>): Promise<boolean> {
  try {
    await delivery
    return true
  } catch {
    // Do not log player snapshots, socket credentials, or arbitrary transport error text.
    console.warn("Game notification could not be delivered")
    return false
  }
}
