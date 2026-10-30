---
{
  "id": "resident-ダニエル",
  "kind": "residents",
  "title": "ダニエル",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "mason",
  "buildings": [
    "building-h-c4"
  ],
  "bedroom_candidates": [
    "room-h-c4-2"
  ],
  "work": "石工の息子",
  "relationships": [
    {
      "a": "マルクス",
      "b": "ダニエル",
      "kind": "親子",
      "note": "無口な父と無口な息子"
    },
    {
      "a": "カタリーナ",
      "b": "ダニエル",
      "kind": "親子",
      "note": ""
    },
    {
      "a": "ダニエル",
      "b": "イダ",
      "kind": "兄妹",
      "note": "拾った石を兄に見せに行く"
    },
    {
      "a": "トビアス",
      "b": "ダニエル",
      "kind": "友人",
      "note": ""
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h-c4-2",
  "bed_id": "bed-h-c4-2-1",
  "design_dependencies": [
    "building-h-c4",
    "room-h-c4-2"
  ],
  "storage_ids": [
    "storage-h-c4-2-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ダニエル"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ダニエル"
  }
}
---

# ダニエル

## 暮らしの立場

ダニエルは石工の息子。石工のマルクスに属し、マルクス、カタリーナ、イダという世帯構成で暮らす。仕事と収入のつながりは石積みと煙突・炉の修理。カタリーナは灰をふるって灰汁を作る。

## 人柄と話し方

性格は力自慢、父に似て無口、動物好き。話し方は「おれ。ぶっきらぼうな少年口調」。口癖は「……別に」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h-c4-2]] の bed-h-c4-2-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
