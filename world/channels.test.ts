import { describe, expect, it } from "vitest";
import { CHANNEL_CAP, CHANNEL_SLACK, chooseChannel, hometownOf, parseRoom, roomName, WORLDS } from "./channels.ts";

describe("parallel towns and channels", () => {
  it("names rooms and reads the names back", () => {
    expect(parseRoom(roomName({ world: 3, map: "phanthiet-market", channel: 2 }))).toEqual({ world: 3, map: "phanthiet-market", channel: 2 });
    expect(parseRoom("phanthiet")).toBeNull();
    expect(parseRoom(`${WORLDS + 1}~phanthiet~1`)).toBeNull();
  });

  it("gives everyone a hometown, the same every time, spread over the towns", () => {
    expect(hometownOf("abc")).toBe(hometownOf("abc"));
    const towns = new Set(Array.from({ length: 200 }, (_, i) => hometownOf(`player-${i}`)));
    expect(towns.size).toBe(WORLDS);
  });

  it("fills a channel up to its cap before opening another, and opens the lowest free one", () => {
    expect(chooseChannel({})).toBe(1);
    expect(chooseChannel({ 1: 10 })).toBe(1);
    expect(chooseChannel({ 1: CHANNEL_CAP })).toBe(2);
    expect(chooseChannel({ 1: CHANNEL_CAP, 2: 3, 3: 20 })).toBe(3); // the fuller one with room
    expect(chooseChannel({ 2: 5 })).toBe(2);
  });

  it("lets a friend or party member follow into a full channel, up to the slack", () => {
    expect(chooseChannel({ 1: CHANNEL_CAP }, { friend: 1 })).toBe(1);
    expect(chooseChannel({ 1: CHANNEL_CAP + CHANNEL_SLACK }, { friend: 1 })).toBe(2);
    expect(chooseChannel({ 1: 5, 2: 5 }, { want: 2 })).toBe(2);
  });
});
