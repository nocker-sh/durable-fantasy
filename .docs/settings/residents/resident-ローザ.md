---
{
  "id": "resident-ローザ",
  "kind": "residents",
  "title": "ローザ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "bakers",
  "buildings": [
    "building-bakery"
  ],
  "bedroom_candidates": [
    "room-bakery-3"
  ],
  "work": "パン屋の娘",
  "relationships": [
    {
      "a": "マルタ",
      "b": "ローザ",
      "kind": "親子",
      "note": "窯の火の番を、ローザは母の横でじっと見ている"
    },
    {
      "a": "ハンス",
      "b": "ローザ",
      "kind": "兄妹",
      "note": "店先の呼び込みは、妹のほうが声が通る"
    },
    {
      "a": "ローザ",
      "b": "ミア",
      "kind": "友人",
      "note": ""
    },
    {
      "a": "ティム",
      "b": "ローザ",
      "kind": "友人",
      "note": ""
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-bakery-3",
  "bed_id": "bed-bakery-3-2",
  "design_dependencies": [
    "building-bakery",
    "room-bakery-3"
  ],
  "storage_ids": [
    "storage-bakery-3-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ローザ"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ローザ"
  }
}
---

# ローザ

## 暮らしの立場

ローザはパン屋の娘。パン屋のマルタとハンスに属し、マルタ、ハンスという世帯構成で暮らす。仕事と収入のつながりはパン焼き。粉は風車、薪は木こりから。

## 人柄と話し方

性格はしっかり者、兄思い、負けず嫌い。話し方は「わたし。子どもらしいが大人びた口調。「〜なの」」。口癖は「お兄ちゃんたら」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-bakery-3]] の bed-bakery-3-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
