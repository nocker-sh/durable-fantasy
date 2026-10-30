---
{
  "id": "resident-コンスタンティン",
  "kind": "residents",
  "title": "コンスタンティン",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "crystal",
  "buildings": [
    "building-crystal"
  ],
  "bedroom_candidates": [
    "room-crystal-3"
  ],
  "work": "結晶商",
  "relationships": [
    {
      "a": "コンスタンティン",
      "b": "ベネディクト",
      "kind": "ぎこちない",
      "note": "結晶を売る者と、女神の力を祀る者。互いに礼は尽くすが、話が続かない"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-crystal-3",
  "bed_id": "bed-crystal-3-1",
  "design_dependencies": [
    "building-crystal",
    "room-crystal-3",
    "room-crystal-1",
    "room-crystal-2"
  ],
  "storage_ids": [
    "storage-crystal-3-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "コンスタンティン"
  },
  "work_rooms": [
    "room-crystal-1",
    "room-crystal-2"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "コンスタンティン"
  }
}
---
# コンスタンティン


## 暮らしの立場

コンスタンティンは結晶商。結晶屋のコンスタンティンに属し、同居人なしという世帯構成で暮らす。仕事と収入のつながりは結晶の小売り。世界樹のふもとの掘り仲間から仕入れる。

## 人柄と話し方

性格は慎重、生真面目、女神を畏れる。話し方は「私。丁寧な敬語」。口癖は「人に向けてはいけません」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-crystal-3]] の bed-crystal-3-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
