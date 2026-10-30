---
{
  "id": "resident-ティム",
  "kind": "residents",
  "title": "ティム",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "lamp",
  "buildings": [
    "building-h9"
  ],
  "bedroom_candidates": [
    "room-h9-3"
  ],
  "work": "子ども",
  "relationships": [
    {
      "a": "アウグスト",
      "b": "ティム",
      "kind": "祖父と孫",
      "note": "火屋を磨くのはティムの役目"
    },
    {
      "a": "ヘートヴィヒ",
      "b": "ティム",
      "kind": "祖母と孫",
      "note": "ティムの両親のことは、二人とも多くを話さない"
    },
    {
      "a": "ティム",
      "b": "ローザ",
      "kind": "友人",
      "note": ""
    }
  ],
  "issues": [
    "寝台・個人収納の平面案を配置。開閉・収納容量と描画は未照合",
    "食事の座席を配置。給水・便所・衣服と寝具の手入れの場所は未照合"
  ],
  "bedroom": "room-h9-3",
  "bed_id": "bed-h9-3-1",
  "design_dependencies": [
    "building-h9",
    "room-h9-3",
    "room-h9-kitchen",
    "room-h9-stairs"
  ],
  "storage_ids": [
    "storage-h9-3-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ティム"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ティム"
  }
}
---

# ティム

## 暮らしの立場

ティムは子ども。灯り直しのアウグストに属し、アウグスト、ヘートヴィヒという世帯構成で暮らす。仕事と収入のつながりは手提げの灯りと燭台の修理（油はジーモン、芯はアガーテから）と、首巻きの編み物。孫のティムを育てている。

## 人柄と話し方

性格はわんぱく、祖父母っ子、寂しがり。話し方は「ぼく。子どもらしい口調。「〜なんだ」」。口癖は「じいちゃんがね」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h9-3]] の bed-h9-3-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
