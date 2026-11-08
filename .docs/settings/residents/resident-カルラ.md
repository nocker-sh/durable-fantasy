---
{
  "id": "resident-カルラ",
  "kind": "residents",
  "title": "カルラ",
  "status": "設計中",
  "source": "apps/main/world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "porters",
  "buildings": [
    "building-h-g8"
  ],
  "bedroom_candidates": [
    "room-h-g8-2"
  ],
  "work": "倉庫の手伝い",
  "relationships": [
    {
      "a": "インゴ",
      "b": "カルラ",
      "kind": "夫婦",
      "note": ""
    },
    {
      "a": "カルラ",
      "b": "ベルント",
      "kind": "仕事仲間",
      "note": "義姉に帳簿で叱られる"
    },
    {
      "a": "ヒルデ",
      "b": "カルラ",
      "kind": "仕事仲間",
      "note": "倉庫の帳簿を二人でつける"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h-g8-2",
  "bed_id": "bed-h-g8-2-2",
  "design_dependencies": [
    "building-h-g8",
    "room-h-g8-1",
    "room-h-g8-2"
  ],
  "storage_ids": [
    "storage-h-g8-2-2"
  ],
  "routine_source": {
    "file": "apps/main/world/town/routines.ts",
    "export": "ROUTINES",
    "key": "カルラ"
  },
  "appearance_source": {
    "file": "apps/main/world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "カルラ"
  }
}
---

# カルラ

## 暮らしの立場

カルラは倉庫の手伝い。インゴとカルラの家に属し、夫のインゴ、義弟のベルントと暮らす。昼の倉庫で荷を数えて帳簿を手伝い、ヒルデから日当を受け取る。

## 人柄と話し方

性格は数に強い、きっちり、夫に厳しい。話し方は「わたし。はっきりした口調。「〜でしょ」」。口癖は「帳簿は嘘をつかない」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。朝に起きて倉庫の前で荷を数え、夕方に戻って家族と夕餉をとって眠る。単に予定の座標へ移動できるだけで生活の成立としない。

## 固有の寝床

常用の寝床は [[room-h-g8-2]] の bed-h-g8-2-2 に割り当てる。夫のインゴと二人用の寝台を分け合い、寝台の自分の側を本人の寝床とする。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。帳簿と書き付けは倉庫の手伝いの道具であり、倉庫の帳簿は倉庫に残し、家には自分の書き付けだけを持ち帰る。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。
