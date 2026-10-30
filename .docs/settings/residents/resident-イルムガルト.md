---
{
  "id": "resident-イルムガルト",
  "kind": "residents",
  "title": "イルムガルト",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "apothecary",
  "buildings": [
    "building-apothecary",
    "building-h-c2"
  ],
  "bedroom_candidates": [
    "room-apothecary-3"
  ],
  "work": "薬師",
  "relationships": [
    {
      "a": "ゲルダ",
      "b": "イルムガルト",
      "kind": "友人",
      "note": "宿の回復薬の作り方を教えたのはイルムガルト。出来のむらを今でも叱る"
    },
    {
      "a": "イルムガルト",
      "b": "エーファ",
      "kind": "師弟",
      "note": "厳しい師匠に叱られながら、薬の名前を全部覚えた"
    },
    {
      "a": "マリー",
      "b": "イルムガルト",
      "kind": "取引相手",
      "note": "茶にする薬草を分けてもらう"
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
  "bedroom": "room-apothecary-3",
  "bed_id": "bed-apothecary-3-1",
  "design_dependencies": [
    "building-apothecary",
    "room-apothecary-3",
    "room-apothecary-1",
    "room-apothecary-2",
    "room-apothecary-5",
    "room-h-c2-entry",
    "room-h-c2-mixing",
    "building-h-c2"
  ],
  "storage_ids": [
    "storage-apothecary-3-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "イルムガルト"
  },
  "work_rooms": [
    "room-apothecary-1",
    "room-apothecary-2",
    "room-apothecary-5",
    "room-h-c2-entry",
    "room-h-c2-mixing"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "イルムガルト"
  }
}
---
# イルムガルト

## 暮らしの立場

イルムガルトは薬師。薬師イルムガルトに属し、エーファという世帯構成で暮らす。仕事と収入のつながりは薬作り（弟子のエーファと）。薬草は自分で草原に摘みに行き、買取屋からも仕入れる。

## 人柄と話し方

性格は厳しい、博識、本当は心配性。話し方は「わたし。年配の女性のきっぱりした口調。「〜なさい」」。口癖は「多めに持っていきなさい」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-apothecary-3]] の bed-apothecary-3-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
