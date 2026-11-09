import { COOKIE } from "#/world/server/session"

/** A confirmed owner's id, with the credential sent again so the cookie's expiry runs from this visit (game-system.md §13). */
export function sessionResponse(request: Request, credential: { id: string; secret: string }): Response {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : ""
  return Response.json(
    { id: credential.id },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": `${COOKIE}=${credential.id}.${credential.secret}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000${secure}`,
      },
    },
  )
}
