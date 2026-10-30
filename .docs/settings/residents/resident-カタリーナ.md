---
{
  "id": "resident-カタリーナ",
  "kind": "residents",
  "title": "カタリーナ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "mason",
  "buildings": [
    "building-h-c4"
  ],
  "bedroom_candidates": [
    "room-h-c4-3"
  ],
  "work": "灰汁作り",
  "relationships": [
    {
      "a": "マルクス",
      "b": "カタリーナ",
      "kind": "夫婦",
      "note": ""
    },
    {
      "a": "カタリーナ",
      "b": "ダニエル",
      "kind": "親子",
      "note": ""
    },
    {
      "a": "カタリーナ",
      "b": "イダ",
      "kind": "親子",
      "note": ""
    },
    {
      "a": "カタリーナ",
      "b": "モニカ",
      "kind": "友人",
      "note": "灰を分け合う隣どうし"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h-c4-3",
  "bed_id": "bed-h-c4-3-2",
  "design_dependencies": [
    "building-h-c4",
    "room-h-c4-3",
    "room-h-c4-lye"
  ],
  "storage_ids": [
    "storage-h-c4-3-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "カタリーナ"
  },
  "work_rooms": [
    "room-h-c4-lye"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "カタリーナ"
  }
}
---
# カタリーナ


## 暮らしの立場

カタリーナは灰汁作り。石工のマルクスに属し、マルクス、ダニエル、イダという世帯構成で暮らす。仕事と収入のつながりは石積みと煙突・炉の修理。カタリーナは灰をふるって灰汁を作る。

## 人柄と話し方

性格はしっかり者、倹約家、笑顔が多い。話し方は「あたし。明るい女言葉。「〜ねえ」」。口癖は「灰汁でなんでも落ちるよ」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h-c4-3]] の bed-h-c4-3-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
