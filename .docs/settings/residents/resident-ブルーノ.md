---
{
  "id": "resident-ブルーノ",
  "kind": "residents",
  "title": "ブルーノ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "general",
  "buildings": [
    "building-general"
  ],
  "bedroom_candidates": [
    "room-general-3"
  ],
  "work": "道具屋",
  "relationships": [
    {
      "a": "ブルーノ",
      "b": "ヘレナ",
      "kind": "仕事仲間",
      "note": "道具屋の夜番と昼番。帳簿の字で互いを知っている"
    },
    {
      "a": "ブルーノ",
      "b": "ベネディクト",
      "kind": "取引相手",
      "note": "修道士の回復薬と粥を、道具屋が預かって売る"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-general-3",
  "bed_id": "bed-general-3-1",
  "design_dependencies": [
    "building-general",
    "room-general-3",
    "room-general-1",
    "room-general-2"
  ],
  "storage_ids": [
    "storage-general-3-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ブルーノ"
  },
  "work_rooms": [
    "room-general-1",
    "room-general-2"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ブルーノ"
  }
}
---
# ブルーノ

## 暮らしの立場

ブルーノは道具屋。道具屋のブルーノに属し、同居人なしという世帯構成で暮らす。仕事と収入のつながりは道具と雑貨の店。

## 人柄と話し方

性格は几帳面、話好き、心配性。話し方は「おれ。商人らしい調子のよさ」。口癖は「旅支度ならおまかせを」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-general-3]] の bed-general-3-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
