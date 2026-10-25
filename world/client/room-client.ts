import type { GameSession } from "./session.ts";
import type { ServerMessageContext } from "./server-context.ts";
import type { VoidSocket } from "void/ws";
import type { Transition } from "../core/apply.ts";
import { REASON_TEXT, type Command } from "../core/commands.ts";
import { MAPS, cellDistance, isMapId, type MapId } from "../maps/index.ts";
import type { Cell } from "../protocol.ts";
import { lap } from "../diagnostics.ts";

const COMMAND_TIMEOUT = 8000;

export class RoomClient {
  private seq = 0;
  constructor(
    private readonly target: Pick<ServerMessageContext, "update" | "getScene" | "onServer" | "preview" | "notify" | "setPlayer" | "report"> & {
      readonly session: Pick<GameSession, "wantChannel" | "rooms" | "state" | "socket" | "arriveAt" | "others" | "playerId" | "waiting">;
    },
  ) {}
  async connect(id: MapId) {
    const want = this.target.session.wantChannel;
    this.target.session.wantChannel = null;
    // a room got ready while walking up to the way in is taken as it is
    const ready = this.target.session.rooms.take(id, want);
    if (ready) {
      const { channel, channels } = await ready.channel;
      if (this.target.session.state.get().map.id !== id) {
        ready.socket.close();
        return;
      }
      lap(ready.open ? "room: was ready" : "room: was being got ready");
      this.target.update({ room: { world: this.target.session.rooms.world, channel, channels } });
      this.target.session.socket = ready.socket;
      this.listen(ready.socket);
      if (ready.open) {
        this.target.update({ online: "online" });
        this.join();
      }
      return;
    }
    const { channel, channels } = await this.target.session.rooms.askChannel(id, want);
    lap("room: channel chosen");
    if (this.target.session.state.get().map.id !== id) return; // moved on meanwhile
    this.target.update({ room: { world: this.target.session.rooms.world, channel, channels } });
    const socket = this.target.session.rooms.open(id, channel);
    this.target.session.socket = socket;
    this.listen(socket);
    // beside a way out, the room beyond is asked for at once, alongside our own
    const beside = this.wayBeside(this.target.session.arriveAt);
    if (beside) this.target.session.rooms.standBy(beside);
  }

  wayBeside(at: Cell | null): MapId | null {
    if (!at) return null;
    const near = MAPS[this.target.session.state.get().map.id].warps.map((w) => ({ w, d: cellDistance(w.at as Cell, at) })).sort((a, b) => a.d - b.d)[0];
    return near && near.d <= 16 && isMapId(near.w.to.map) ? near.w.to.map : null;
  }

  standBy(map: MapId) {
    if (this.target.session.others.you) this.target.session.rooms.standBy(map);
  }

  listen(socket: VoidSocket<"/map/:mapId">) {
    socket.on("open", () => {
      if (this.target.session.socket !== socket) return;
      lap("room: socket open");
      this.target.update({ online: "online" });
      this.join();
    });
    socket.on("close", () => {
      if (this.target.session.socket !== socket) return;
      this.target.update({ online: "offline" });
      this.target.session.others.clear();
      this.target.getScene()?.clearRemotes();
    });
    socket.on("message", (message) => {
      if (this.target.session.socket === socket) this.target.onServer(message);
    });
  }

  join() {
    const scene = this.target.getScene();
    const at = scene?.ready ? scene.playerCell() : this.target.session.arriveAt;
    if (!this.target.session.socket || !at || this.target.session.others.you) return;
    const clock = this.target.session.state.get().clock;
    this.target.session.socket.send({ type: "join", player: this.target.session.playerId, at, ...(import.meta.env.DEV && clock.held ? { time: clock.min } : {}) });
  }

  async run(command: Command, send?: (seq: number) => void): Promise<boolean> {
    const local = send ? null : this.target.preview(command);
    if (local) {
      this.target.notify(REASON_TEXT[local], "bad");
      return false;
    }
    const socket = this.target.session.socket;
    if (!socket) return false;
    const seq = ++this.seq;
    this.target.update({ busy: true });
    const result = await new Promise<Transition>((resolve) => {
      this.target.session.waiting.set(seq, resolve);
      if (send) send(seq);
      else socket.send({ type: "command", seq, command });
      setTimeout(() => {
        if (this.target.session.waiting.delete(seq)) resolve({ ok: false, reason: "OFFLINE" });
      }, COMMAND_TIMEOUT);
    });
    this.target.update({ busy: false });
    if (!result.ok) {
      this.target.notify(REASON_TEXT[result.reason], "bad");
      return false;
    }
    this.target.setPlayer(result.state);
    for (const event of result.events) this.target.report(event);
    return true;
  }
}
