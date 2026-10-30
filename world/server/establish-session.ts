import { Player } from "#/durable-objects/player"
import { COOKIE } from "#/world/server/session"
import { sameOrigin } from "#/world/server/same-origin"
import { sessionCookie } from "#/world/server/session-cookie"
import { secretHash } from "#/world/server/secret-hash"
import { authenticatedPlayer } from "#/world/server/authenticated-player"

/** Upgrade the old private bearer id once; after that, the id alone cannot open a session. */
export async function establishSession(request: Request, legacyId?: string, proof?: string): Promise<Response> {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 })
  const current = await authenticatedPlayer(request)
  if (current) return Response.json({ id: current }, { headers: { "Cache-Control": "no-store" } })
  // Do not silently replace an existing cookie or a legacy save if ownership cannot be proven.
  if (sessionCookie(request)) return new Response("Session could not be restored", { status: 401 })
  if (!legacyId || !proof || !/^[a-f0-9]{64}$/.test(proof)) return new Response("Creation proof required", { status: 400 })
  const id = legacyId
  const secret = proof
  if (!(await Player.get(id).claim(await secretHash(secret)))) return new Response("Use the browser that owns this character", { status: 409 })
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : ""
  return Response.json(
    { id },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": `${COOKIE}=${id}.${secret}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000${secure}`,
      },
    },
  )
}
