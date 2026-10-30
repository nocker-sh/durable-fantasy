---
{
  "id": "resident-ドロテア",
  "kind": "residents",
  "title": "ドロテア",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "teacher",
  "buildings": [
    "building-h-g5"
  ],
  "bedroom_candidates": [
    "room-h-g5-3"
  ],
  "work": "産婆",
  "relationships": [
    {
      "a": "クリスティアン",
      "b": "ドロテア",
      "kind": "夫婦",
      "note": ""
    },
    {
      "a": "ドロテア",
      "b": "ラウラ",
      "kind": "親子",
      "note": ""
    },
    {
      "a": "ドロテア",
      "b": "ベンヤミン",
      "kind": "親子",
      "note": ""
    },
    {
      "a": "ドロテア",
      "b": "イルムガルト",
      "kind": "友人",
      "note": "夜中に呼ばれる者どうし"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h-g5-3",
  "bed_id": "bed-h-g5-3-2",
  "design_dependencies": [
    "building-h-g5",
    "room-h-g5-3",
    "room-h-g5-care"
  ],
  "storage_ids": [
    "storage-h-g5-3-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ドロテア"
  },
  "work_rooms": [
    "room-h-g5-care"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ドロテア"
  }
}
---
# ドロテア


## 暮らしの立場

ドロテアは産婆。先生のクリスティアンに属し、クリスティアン、ラウラ、ベンヤミンという世帯構成で暮らす。仕事と収入のつながりは寄り合い所で子どもに読み書きを教える（給金は寄り合いから）。ドロテアは産婆。

## 人柄と話し方

性格は落ち着いている、頼りになる、夜に強い。話し方は「わたし。静かで温かい口調」。口癖は「大丈夫、ちゃんと生まれてくるから」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h-g5-3]] の bed-h-g5-3-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
