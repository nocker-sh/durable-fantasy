---
{
  "id": "resident-トビアス",
  "kind": "residents",
  "title": "トビアス",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "sweep",
  "buildings": [
    "building-h-c5"
  ],
  "bedroom_candidates": [
    "room-h-c5-tobias"
  ],
  "work": "煙突掃除の弟子",
  "relationships": [
    {
      "a": "ベルンハルト",
      "b": "トビアス",
      "kind": "師弟",
      "note": "住み込みの弟子。細い煙突はトビアスが潜る"
    },
    {
      "a": "モニカ",
      "b": "トビアス",
      "kind": "仕事仲間",
      "note": "弟子の腹を満たすのはモニカ"
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
  "bedroom": "room-h-c5-tobias",
  "bed_id": "bed-h-c5-3-3",
  "design_dependencies": [
    "building-h-c5",
    "room-h-c5-processing",
    "room-h-c5-tobias"
  ],
  "storage_ids": [
    "storage-h-c5-3-3"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "トビアス"
  },
  "work_rooms": [
    "room-h-c5-processing"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "トビアス"
  }
}
---
# トビアス


## 暮らしの立場

トビアスは煙突掃除の弟子。煙突掃除のベルンハルトに属し、ベルンハルト、モニカという世帯構成で暮らす。仕事と収入のつながりは煙突掃除と屋根の灰下ろし。集めた灰はモニカが陶工と畑に売る。トビアスは住み込みの弟子。

## 人柄と話し方

性格は身軽、怖いもの知らず、腹ぺこ。話し方は「おれ。元気な少年口調。「〜だぜ」」。口癖は「親方の真似」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h-c5-tobias]] の bed-h-c5-3-3 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
