import { z } from "zod"
import { playerId } from "#/world/core/identity"
import { STORAGE } from "#/world/client/identity"

const sessionResponse = z.object({ id: playerId })

export async function openSession(): Promise<string> {
  const key = `${STORAGE}/player`
  const legacyId = { value: localStorage.getItem(key) }
  if (!playerId.safeParse(legacyId.value).success) {
    legacyId.value = crypto.randomUUID()
    localStorage.setItem(key, legacyId.value)
  }
  const proofKey = `${STORAGE}/session-proof`
  const proof = { value: localStorage.getItem(proofKey) }
  if (!proof.value || !/^[a-f0-9]{64}$/.test(proof.value)) {
    proof.value = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("")
    localStorage.setItem(proofKey, proof.value)
  }
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ legacyId: legacyId.value, proof: proof.value }),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error("Session could not be restored")
  const confirmed = sessionResponse.safeParse(await response.json())
  if (!confirmed.success) throw new Error("Session could not be restored")
  const id = confirmed.data.id
  localStorage.setItem(key, id)
  localStorage.removeItem(proofKey)
  return id
}
