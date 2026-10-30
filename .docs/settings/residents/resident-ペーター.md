---
{
  "id": "resident-ペーター",
  "kind": "residents",
  "title": "ペーター",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "smith",
  "buildings": [
    "building-smithy"
  ],
  "bedroom_candidates": [
    "room-smithy-peter"
  ],
  "work": "鍛冶見習い",
  "relationships": [
    {
      "a": "ギュンター",
      "b": "ペーター",
      "kind": "師弟",
      "note": "親方は厳しいが、見習いの火傷にはすぐ薬を塗ってやる"
    },
    {
      "a": "ペーター",
      "b": "フリッツ",
      "kind": "友人",
      "note": "広場で遊ぶ仲。ペーターが仕事を覚えてから会う時間が減った"
    },
    {
      "a": "ペーター",
      "b": "ミア",
      "kind": "友人",
      "note": ""
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-smithy-peter",
  "bed_id": "bed-smithy-2-2",
  "design_dependencies": [
    "building-smithy",
    "room-smithy-peter",
    "room-smithy-1"
  ],
  "storage_ids": [
    "storage-smithy-2-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ペーター"
  },
  "work_rooms": [
    "room-smithy-1"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ペーター"
  }
}
---
# ペーター

## 暮らしの立場

ペーターは鍛冶見習い。鍛冶屋のギュンターと見習いに属し、ギュンターという世帯構成で暮らす。仕事と収入のつながりは鍛冶。炭は木こりのヨーゼフが焼き、鉄はラインホルトが買い取る古い鉄くずと鍋から。大物を打つときだけ職人通りの共同の炉を借りる。

## 人柄と話し方

性格は素直、夢見がち、そそっかしい。話し方は「ぼく。丁寧語。「〜です！」と弾む」。口癖は「親方みたいに」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-smithy-peter]] の bed-smithy-2-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
