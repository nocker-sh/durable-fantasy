---
{
  "id": "resident-ベルント",
  "kind": "residents",
  "title": "ベルント",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "porters",
  "buildings": [
    "building-h-g8"
  ],
  "bedroom_candidates": [
    "room-h-g8-3"
  ],
  "work": "荷担ぎ",
  "relationships": [
    {
      "a": "インゴ",
      "b": "ベルント",
      "kind": "兄弟",
      "note": "兄の後について荷を担ぐ"
    },
    {
      "a": "カルラ",
      "b": "ベルント",
      "kind": "仕事仲間",
      "note": "義姉に帳簿で叱られる"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h-g8-3",
  "bed_id": "bed-h-g8-3-1",
  "design_dependencies": [
    "building-h-g8",
    "room-h-g8-1",
    "room-h-g8-3"
  ],
  "storage_ids": [
    "storage-h-g8-3-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ベルント"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ベルント"
  }
}
---

# ベルント

## 暮らしの立場

ベルントは荷担ぎ。インゴとカルラの家に属し、兄のインゴ、義姉のカルラと暮らす。兄の後について倉庫と門の荷を担ぎ、倉庫のヒルデから日当を受け取る。

## 人柄と話し方

性格はのんき、兄思い、昼寝好き。話し方は「おれ。のんびりした口調。「〜だなあ」」。口癖は「兄貴がやるなら」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。朝に起きて倉庫の前で荷を担ぎ、夕方に戻って家族と夕餉をとって眠る。単に予定の座標へ移動できるだけで生活の成立としない。

## 固有の寝床

常用の寝床は [[room-h-g8-3]] の bed-h-g8-3-1 に割り当てる。二階の個室に本人の寝台を一つ持ち、兄夫婦と寝台を共用しない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。荷縄と肩当ては荷担ぎの道具であり、帰宅すると兄の荷縄の隣に掛ける。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。
