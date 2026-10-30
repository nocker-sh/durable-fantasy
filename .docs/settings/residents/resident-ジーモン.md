---
{
  "id": "resident-ジーモン",
  "kind": "residents",
  "title": "ジーモン",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "candle",
  "buildings": [
    "building-h-m2"
  ],
  "bedroom_candidates": [
    "room-h-m2-3"
  ],
  "work": "油売り",
  "relationships": [
    {
      "a": "アウグスト",
      "b": "ジーモン",
      "kind": "取引相手",
      "note": "灯り油はジーモンから"
    },
    {
      "a": "アガーテ",
      "b": "ジーモン",
      "kind": "夫婦",
      "note": "ろうそくを作る妻と、油を売り歩く夫"
    },
    {
      "a": "ジーモン",
      "b": "フェリックス",
      "kind": "親子",
      "note": "父の売り声をまねて叱られる"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h-m2-3",
  "bed_id": "bed-h-m2-3-2",
  "design_dependencies": [
    "building-h-m2",
    "room-h-m2-3",
    "room-h-m2-oil-store"
  ],
  "storage_ids": [
    "storage-h-m2-3-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ジーモン"
  },
  "work_rooms": [
    "room-h-m2-oil-store"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ジーモン"
  }
}
---
# ジーモン


## 暮らしの立場

ジーモンは油売り。ろうそく屋のアガーテとジーモンに属し、アガーテ、フェリックスという世帯構成で暮らす。仕事と収入のつながりはろうそく作り（獣脂はファルクとブリギッテ、蜜蝋はウルリケの巣箱から）と、灯り油の売り歩き。

## 人柄と話し方

性格は歩き回る、顔が広い、冗談好き。話し方は「おれ。調子のいい口調。「〜だろ？」」。口癖は「油はいらんかね」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h-m2-3]] の bed-h-m2-3-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
