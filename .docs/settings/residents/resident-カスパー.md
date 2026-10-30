---
{
  "id": "resident-カスパー",
  "kind": "residents",
  "title": "カスパー",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "buyer",
  "buildings": [
    "building-buyer"
  ],
  "bedroom_candidates": [
    "room-buyer-kaspar"
  ],
  "work": "荷運び",
  "relationships": [
    {
      "a": "ラインホルト",
      "b": "カスパー",
      "kind": "祖父と孫",
      "note": "祖父の荷を黙って担ぐ"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-buyer-kaspar",
  "bed_id": "bed-buyer-3-2",
  "design_dependencies": [
    "building-buyer",
    "room-buyer-3",
    "room-buyer-1",
    "room-buyer-2",
    "room-buyer-raw-store",
    "room-buyer-kaspar"
  ],
  "storage_ids": [
    "storage-buyer-3-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "カスパー"
  },
  "work_rooms": [
    "room-buyer-1",
    "room-buyer-2",
    "room-buyer-raw-store"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "カスパー"
  }
}
---
# カスパー


## 暮らしの立場

カスパーは荷運び。買取屋のラインホルトに属し、ラインホルトという世帯構成で暮らす。仕事と収入のつながりは素材の買い取りと卸し。孫のカスパーが荷を運ぶ。

## 人柄と話し方

性格は力持ち、祖父思い、口が重い。話し方は「おれ。言葉少な。「……ああ」」。口癖は「じいさんが言うには」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-buyer-kaspar]] の bed-buyer-3-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
