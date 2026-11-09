import { describe, expect, it } from "vitest"
import { CHANNEL_CAP, CHANNEL_SLACK, CHANNELS, OPEN_TOWNS, WORLDS } from "#/world/channels"
import { chooseChannel } from "#/world/choose-channel"
import { hometownOf } from "#/world/hometown-of"
import { parseRoom } from "#/world/parse-room"
import { roomName } from "#/world/room-name"

describe("parallel towns and channels", () => {
  it("names rooms and reads the names back", () => {
    expect(parseRoom(roomName({ world: 3, map: "phanthiet-market", channel: 2 }))).toEqual({ world: 3, map: "phanthiet-market", channel: 2 })
    expect(parseRoom("phanthiet")).toBeNull()
    expect(parseRoom(`${WORLDS + 1}~phanthiet~1`)).toBeNull()
  })

  it("opens a room for every channel the directory can give and for no other", () => {
    expect(parseRoom(`3~phanthiet~${CHANNELS}`)).toEqual({ world: 3, map: "phanthiet", channel: CHANNELS })
    expect(parseRoom(`3~phanthiet~${CHANNELS + 1}`)).toBeNull()
    expect(parseRoom("3~phanthiet~0")).toBeNull()
    // one channel, one room: a second spelling of the same number is not another room
    expect(parseRoom("3~phanthiet~01")).toBeNull()
    expect(parseRoom("03~phanthiet~1")).toBeNull()
  })

  it("gives everyone a hometown, the same every time, spread over the open towns", () => {
    expect(hometownOf("abc")).toBe(hometownOf("abc"))
    const towns = new Set(Array.from({ length: 200 }, (_, i) => hometownOf(`player-${i}`)))
    expect(towns.size).toBe(OPEN_TOWNS)
    expect(OPEN_TOWNS).toBeLessThanOrEqual(WORLDS)
  })

  it("fills a channel up to its cap before opening another, and opens the lowest free one", () => {
    expect(chooseChannel({})).toBe(1)
    expect(chooseChannel({ 1: 10 })).toBe(1)
    expect(chooseChannel({ 1: CHANNEL_CAP })).toBe(2)
    expect(chooseChannel({ 1: CHANNEL_CAP, 2: 3, 3: 20 })).toBe(3) // the fuller one with room
    expect(chooseChannel({ 2: 5 })).toBe(2)
  })

  it("lets a friend or party member follow into a full channel, up to the slack", () => {
    expect(chooseChannel({ 1: CHANNEL_CAP }, { friend: 1 })).toBe(1)
    expect(chooseChannel({ 1: CHANNEL_CAP + CHANNEL_SLACK }, { friend: 1 })).toBe(2)
    expect(chooseChannel({ 1: 5, 2: 5 }, { want: 2 })).toBe(2)
  })

  it("names no room past the last channel, and never chooses one", () => {
    expect(parseRoom(roomName({ world: 1, map: "phanthiet", channel: CHANNELS }))).toEqual({ world: 1, map: "phanthiet", channel: CHANNELS })
    expect(parseRoom("1~phanthiet~0")).toBeNull()
    expect(parseRoom(roomName({ world: 1, map: "phanthiet", channel: CHANNELS + 1 }))).toBeNull()
    // a channel asked for or followed past the last is passed over for one with room
    expect(chooseChannel({ 1: 5 }, { want: CHANNELS + 1 })).toBe(1)
    expect(chooseChannel({ 1: 5 }, { friend: CHANNELS + 1 })).toBe(1)
    expect(chooseChannel({ 1: 5 }, { want: 1.5 })).toBe(1)
    expect(chooseChannel({ [CHANNELS + 1]: 1 })).toBe(1)
    // with every channel taken the last one is chosen, and its room turns the arrival away when full
    const taken = Object.fromEntries(Array.from({ length: CHANNELS }, (_, i) => [i + 1, CHANNEL_CAP]))
    expect(chooseChannel(taken)).toBe(CHANNELS)
  })
})
