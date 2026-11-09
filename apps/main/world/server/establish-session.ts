import { Player } from "#/durable-objects/player"
import { sameOrigin } from "#/world/server/same-origin"
import { sessionCookie } from "#/world/server/session-cookie"
import { secretHash } from "#/world/server/secret-hash"
import { authenticatedPlayer } from "#/world/server/authenticated-player"
import { sessionResponse } from "#/world/server/session-response"

/** Upgrade the old private bearer id once; after that, the id alone cannot open a session. */
export async function establishSession(request: Request, legacyId?: string, proof?: string): Promise<Response> {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 })
  const current = await authenticatedPlayer(request)
  const cookie = sessionCookie(request)
  // the same credential again, so a browser that keeps coming back keeps its cookie
  if (current && cookie) return sessionResponse(request, { id: current, secret: cookie.secret })
  // Do not silently replace an existing cookie or a legacy save if ownership cannot be proven.
  if (cookie) return new Response("Session could not be restored", { status: 401 })
  if (!legacyId || !proof || !/^[a-f0-9]{64}$/.test(proof)) return new Response("Creation proof required", { status: 400 })
  const id = legacyId
  const secret = proof
  if (!(await Player.get(id).claim(await secretHash(secret)))) return new Response("Use the browser that owns this character", { status: 409 })
  return sessionResponse(request, { id, secret })
}
