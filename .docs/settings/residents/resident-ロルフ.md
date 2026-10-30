---
{
  "id": "resident-ロルフ",
  "kind": "residents",
  "title": "ロルフ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "hunter",
  "buildings": [
    "building-h-g4"
  ],
  "bedroom_candidates": [
    "room-h-g4-4"
  ],
  "work": "猟師の息子",
  "relationships": [
    {
      "a": "ファルク",
      "b": "ロルフ",
      "kind": "親子",
      "note": "森の歩き方を教わっている"
    },
    {
      "a": "ブリギッテ",
      "b": "ロルフ",
      "kind": "親子",
      "note": ""
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h-g4-4",
  "bed_id": "bed-h-g4-4-1",
  "design_dependencies": [
    "building-h-g4",
    "room-h-g4-4"
  ],
  "storage_ids": [
    "storage-h-g4-4-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ロルフ"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ロルフ"
  }
}
---
# ロルフ


## 暮らしの立場

ロルフは猟師の息子。猟師のファルクに属し、ファルク、ブリギッテという世帯構成で暮らす。仕事と収入のつながりは森の猟。皮はルドルフへ、脂はろうそく屋へ、肉はブリギッテが燻して宿と酒場へ。

## 人柄と話し方

性格は素直、弓の名手、町の暮らしに憧れる。話し方は「おれ。若者らしい素直な口調」。口癖は「親父はすごいんだ」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h-g4-4]] の bed-h-g4-4-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
