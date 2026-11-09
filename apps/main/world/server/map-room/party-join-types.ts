import type { Party } from "#/durable-objects/party"

export type PartyJoinContext = Readonly<{ id: string; mapName: string; inviter?: string; party: Pick<ReturnType<typeof Party.get>, "join"> }>
