import { Player } from "../../durable-objects/player.ts"
import { playerId } from "../core/identity.ts"

const COOKIE = "df-session"

export function sameOrigin(request: Request): boolean {
  return request.headers.get("origin") === new URL(request.url).origin
}

export function sessionCookie(request: Request): { id: string; secret: string } | null {
  const value = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1)
  if (!value) return null
  const [id, secret, extra] = value.split(".")
  return !extra && playerId.safeParse(id).success && /^[a-f0-9]{64}$/.test(secret ?? "") ? { id, secret } : null
}

export async function secretHash(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function authenticatedPlayer(request: Request): Promise<string | null> {
  const cookie = sessionCookie(request)
  if (!cookie) return null
  return (await Player.get(cookie.id).authenticate(await secretHash(cookie.secret))) ? cookie.id : null
}

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
