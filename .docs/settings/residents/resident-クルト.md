---
{
  "id": "resident-クルト",
  "kind": "residents",
  "title": "クルト",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "tinker",
  "buildings": [
    "building-h-g2"
  ],
  "bedroom_candidates": [
    "room-h-g2-3"
  ],
  "work": "鋳掛け屋",
  "relationships": [
    {
      "a": "クルト",
      "b": "ザビーネ",
      "kind": "夫婦",
      "note": ""
    },
    {
      "a": "クルト",
      "b": "ヨハン",
      "kind": "親子",
      "note": ""
    },
    {
      "a": "クルト",
      "b": "リナ",
      "kind": "親子",
      "note": ""
    },
    {
      "a": "クルト",
      "b": "ラインホルト",
      "kind": "取引相手",
      "note": "錫と古鍋を買う"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h-g2-3",
  "bed_id": "bed-h-g2-3-1",
  "design_dependencies": [
    "building-h-g2",
    "room-h-g2-3",
    "room-h-g2-repair"
  ],
  "storage_ids": [
    "storage-h-g2-3-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "クルト"
  },
  "work_rooms": [
    "room-h-g2-repair"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "クルト"
  }
}
---
# クルト


## 暮らしの立場

クルトは鋳掛け屋。鋳掛け屋のクルトに属し、ザビーネ、ヨハン、リナという世帯構成で暮らす。仕事と収入のつながりは鍋と釜の鋳掛け、刃物研ぎ（ザビーネ）。錫はラインホルトから。

## 人柄と話し方

性格は器用、話好き、楽天家。話し方は「おれ。陽気な職人口調。「〜さ」」。口癖は「穴は塞げば穴じゃない」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h-g2-3]] の bed-h-g2-3-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
