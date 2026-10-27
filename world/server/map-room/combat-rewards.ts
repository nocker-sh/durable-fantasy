// Award a defeated creature's drops and experience; share arithmetic lives in core/party.ts.
import type { WebSocketConnection } from "void/ws"
import { Party } from "../../../durable-objects/party.ts"
import { Player } from "../../../durable-objects/player.ts"
import { shareOut } from "../../core/party.ts"
import { dropsOf, type MonsterKind } from "../../core/monsters.ts"
import type { PlayerState } from "../../core/player.ts"
import type { ServerMessage } from "../../protocol.ts"
import type { Ctx } from "./context.ts"
import { presence } from "./presence.ts"

export async function awardDefeat(roomCtx: Pick<Ctx, "ctx" | "me">, owner: string, data: Pick<PlayerState, "party" | "level">, monster: string, kind: MonsterKind): Promise<void> {
  const { ctx, me } = roomCtx
  const items = dropsOf(
    kind,
    kind.drops.map(() => Math.random()),
  )
  // in a party sharing evenly, those of it on this map share the experience (core/party.ts)
  let exp = kind.exp
  const party = me.party && data.party === me.party ? await Party.get(me.party).view() : null
  if (party?.mode === "even" && party.members.some((member) => member.owner === owner)) {
    const near: { owner: string; level: number; conn: WebSocketConnection<ServerMessage> }[] = []
    const members = new Set(party.members.map((member) => member.owner))
    const seen = new Set([owner])
    for (const c of ctx.room.getConnections()) {
      const p = presence(c)
      if (!p.owner || p.closed || p.down || p.party !== me.party || !members.has(p.owner) || seen.has(p.owner)) continue
      seen.add(p.owner)
      // Presence may still show the old HP or party after a fall or departure.
      const member = await Player.get(p.owner).read()
      if (member.hp > 0 && member.party === me.party) near.push({ owner: p.owner, level: member.level, conn: c })
    }
    const shares = shareOut(kind.exp, "even", { owner, level: data.level }, near)
    exp = shares.find((x) => x.owner === owner)!.exp
    for (const sh of shares) {
      const m = near.find((x) => x.owner === sh.owner)
      if (m) await m.conn.send({ type: "result", seq: -1, result: await Player.get(m.owner).run({ type: "share", exp: sh.exp, monster }) })
    }
  }
  const result = await Player.get(owner).run({ type: "loot", monster, exp, items })
  await ctx.connection.send({ type: "result", seq: -1, result })
}
