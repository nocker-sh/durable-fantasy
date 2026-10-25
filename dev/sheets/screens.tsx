import { sheet } from "./schema.ts"

const SCREENS: { id: string; name: string; kind: string }[] = [
  { id: "loading", name: "読み込み", kind: "画面の間" },
  { id: "fallen", name: "倒れた", kind: "画面の間" },
  { id: "offline", name: "道が途切れた", kind: "画面の間" },
  { id: "failed", name: "描けなかった", kind: "画面の間" },
  { id: "status", name: "体力の枠", kind: "常に出ている" },
  { id: "hotbar", name: "ホットバー", kind: "常に出ている" },
  { id: "chat", name: "チャット", kind: "常に出ている" },
  { id: "inventory", name: "持ち物", kind: "ウィンドウ" },
  { id: "equipment", name: "装備", kind: "ウィンドウ" },
  { id: "stats", name: "能力", kind: "ウィンドウ" },
  { id: "worldmap", name: "地図", kind: "ウィンドウ" },
  { id: "shop", name: "店", kind: "ウィンドウ" },
  { id: "dialogue", name: "会話", kind: "ウィンドウ" },
  { id: "system", name: "メニュー", kind: "モーダル" },
  { id: "character", name: "キャラクター", kind: "モーダル" },
]

const screens = sheet<(typeof SCREENS)[number]>({
  id: "screens",
  label: "画面",
  rows: () => SCREENS,
  key: (x) => x.id,
  name: (x) => x.name,
  kind: (x) => x.kind,
  cols: [],
  more: (x) => [
    { title: "見た目", head: [], wide: true, rows: [[<iframe key="f" title={x.name} src={`/dev/ui/frame?window=${x.id}`} className="aspect-video max-h-[70svh] w-full rounded-lg border" />]] },
  ],
})

export { screens }
