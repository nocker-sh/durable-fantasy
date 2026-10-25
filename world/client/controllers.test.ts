import { afterEach, describe, expect, it, vi } from "vitest";
import type { VoidSocket } from "void/ws";
import type { GameState } from "../state.ts";
import type { MapScene } from "../scene/index.ts";
import { player } from "../test/helpers.ts";
import { RoomClient } from "./room-client.ts";
import { GameSession, createSessionContext } from "./session.ts";
import { DialogueActions } from "./dialogue.ts";
import { SocialActions } from "./social.ts";
import { STORAGE_KEEPER } from "../core/storage.ts";
import { remoteAvatar } from "./identity.ts";

function fixture() {
  const session = new GameSession();
  const send = vi.fn();
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">;
  const freeze = vi.fn();
  const update = (patch: Partial<GameState> | ((state: GameState) => Partial<GameState>)) => session.state.set((state) => ({ ...state, ...(typeof patch === "function" ? patch(state) : patch) }));
  let client: RoomClient;
  const callbacks: Parameters<typeof createSessionContext>[1] = {
    getScene: () => ({ freeze }) as unknown as MapScene,
    preview: vi.fn(() => null),
    onServer: vi.fn(),
    wayBeside: () => null,
    standBy: vi.fn(),
    avatarOf: remoteAvatar,
    setPlayer: vi.fn((player) => update({ player })),
    maybeReady: vi.fn(),
    report: vi.fn(),
    connect: async () => {},
    visitTown: vi.fn(),
    update,
    run: (command, send) => client.run(command, send),
    notify: vi.fn(),
    addChat: vi.fn(),
    toggleWindow: vi.fn(),
    lookAtShop: vi.fn(),
    enterMap: vi.fn(),
  };
  const context = createSessionContext(session, callbacks);
  client = new RoomClient(context);
  return { session, context, callbacks, client, send, freeze };
}

afterEach(() => vi.useRealTimers());

describe("client controllers", () => {
  it("keeps session references live when sockets and channel selections change", () => {
    const { session, context } = fixture();
    session.socket = null;
    expect(context.session.socket).toBeNull();
    context.session.wantChannel = 4;
    expect(session.wantChannel).toBe(4);
    context.session.warping = true;
    expect(session.warping).toBe(true);
  });

  it("correlates a command with its reply, applies the player and clears busy state", async () => {
    vi.useFakeTimers();
    const { session, client, callbacks, send } = fixture();
    const result = client.run({ type: "use", slot: 0 });
    expect(session.state.get().busy).toBe(true);
    expect(send).toHaveBeenCalledWith({ type: "command", seq: 1, command: { type: "use", slot: 0 } });
    const next = player();
    session.waiting.get(1)!({ ok: true, state: next, events: [] });
    session.waiting.delete(1);
    expect(await result).toBe(true);
    expect(callbacks.setPlayer).toHaveBeenCalledWith(next);
    expect(session.state.get().busy).toBe(false);
  });

  it("times out a missing reply and leaves the client ready for another command", async () => {
    vi.useFakeTimers();
    const { session, client, callbacks } = fixture();
    const result = client.run({ type: "use", slot: 0 });
    await vi.advanceTimersByTimeAsync(8000);
    expect(await result).toBe(false);
    expect(session.waiting.size).toBe(0);
    expect(session.state.get().busy).toBe(false);
    expect(callbacks.notify).toHaveBeenCalled();
  });

  it("opens storage from a conversation and updates the scene and server together", () => {
    const { session, context, callbacks, send, freeze } = fixture();
    callbacks.update({ dialogue: { resident: 0, name: STORAGE_KEEPER, job: "倉庫", pages: ["どうぞ"], page: 0, shownAt: 0, choices: [{ label: "預ける", action: "storage" }] } });
    new DialogueActions(context).choose(0);
    expect(session.state.get().dialogue).toBeNull();
    expect(session.state.get().storage).toBe(true);
    expect(session.engaged).toBe(STORAGE_KEEPER);
    expect(freeze).toHaveBeenCalledWith(true);
    expect(send).toHaveBeenCalledWith({ type: "engage", npc: STORAGE_KEEPER });
    expect(callbacks.toggleWindow).toHaveBeenCalledWith("inventory");
  });

  it("sends trade requests through the current socket", () => {
    const { context, send } = fixture();
    new SocialActions(context).askTrade("other-player");
    expect(send).toHaveBeenCalledWith({ type: "trade-ask", target: "other-player" });
  });
});
