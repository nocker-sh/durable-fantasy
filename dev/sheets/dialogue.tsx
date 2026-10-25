import { eventOf } from "#/world/town/events.ts";
import { REASON_TEXT } from "#/world/core/commands.ts";
import { FLAVOR } from "#/world/town/flavor.ts";
import { ALL_LINES } from "#/world/town/lines/index.ts";
import { sheet } from "./schema.ts";
import { ref, mapName } from "./shared.tsx";

type EventRow = { day: string; event: string };

const events = sheet<EventRow>({
  id: "events",
  label: "町の出来事",
  rows: () => {
    const out: EventRow[] = [];
    const start = Date.parse("2026-01-01T03:00:00Z");
    for (let d = 0; d < 365; d++) {
      const e = eventOf(start + d * 86_400_000);
      if (e) out.push({ day: new Date(start + d * 86_400_000).toISOString().slice(0, 10), event: e });
    }
    return out;
  },
  key: (r) => r.day,
  name: (r) => r.event,
  kind: (r) => r.event,
  cols: [],
});

type LineRow = { who: string; n: number };

const lines = sheet<LineRow>({
  id: "lines",
  label: "台詞",
  rows: () => Object.entries(ALL_LINES).flatMap(([who, ls]) => ls.map((_, n) => ({ who, n }))),
  key: (r) => `${r.who}-${r.n + 1}`,
  name: (r) => ALL_LINES[r.who][r.n].text,
  kind: (r) => r.who,
  cols: [
    { label: "時間帯", get: (r) => ALL_LINES[r.who][r.n].phase?.join("・") ?? "", w: "w-24" },
    { label: "していること", get: (r) => ALL_LINES[r.who][r.n].doing ?? "", w: "w-28" },
    { label: "出来事", get: (r) => ALL_LINES[r.who][r.n].event ?? "", w: "w-20" },
  ],
  refs: (r) => [...ref("npcs", r.who, "話す人"), ...ref("npcs", ALL_LINES[r.who][r.n].near, "近くに")],
});

const messages = sheet<string>({
  id: "messages",
  label: "断りの文",
  rows: () => Object.keys(REASON_TEXT),
  key: (k) => k,
  name: (k) => REASON_TEXT[k as keyof typeof REASON_TEXT],
  kind: () => "画面に出る文",
  cols: [],
});

const flavor = sheet<(typeof FLAVOR)[number]>({
  id: "flavor",
  label: "読み込みの一節",
  rows: () => FLAVOR,
  key: (f) => String(FLAVOR.indexOf(f) + 1),
  name: (f) => f.text.replace("\n", " "),
  kind: (f) => (f.at ? mapName(f.at) : "どこでも"),
  cols: [],
  refs: (f) => ref("maps", f.at, "その地へ行くとき"),
});

export { events, lines, messages, flavor };
