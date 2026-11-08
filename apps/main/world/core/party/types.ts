export type ShareMode = "own" | "even"

export type Member = {
  owner: string
  name: string
  level: number
  hp: number
  maxHp: number
  /** the map's name, as last reported */
  map: string
  /** when they last reported (ms) */
  at: number
}

export type Party = {
  leader: string
  mode: ShareMode
  members: Member[]
}
