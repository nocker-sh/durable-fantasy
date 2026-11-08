---
{
  "id": "resident-コンラート",
  "kind": "residents",
  "title": "コンラート",
  "status": "設計中",
  "source": "apps/main/world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "watch",
  "buildings": [
    "building-h-g7"
  ],
  "bedroom_candidates": [
    "room-h-g7-2"
  ],
  "work": "衛兵（朝番）",
  "relationships": [
    {
      "a": "コンラート",
      "b": "ヘンリケ",
      "kind": "仕事仲間",
      "note": "朝番と昼番。門の前で番を渡す"
    },
    {
      "a": "ロータル",
      "b": "コンラート",
      "kind": "仕事仲間",
      "note": "夜番と朝番。夜明け前に番を渡す"
    },
    {
      "a": "オイゲン",
      "b": "コンラート",
      "kind": "師弟",
      "note": "門の番の心得"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h-g7-2",
  "bed_id": "bed-h-g7-2-1",
  "design_dependencies": [
    "building-h-g7",
    "room-h-g7-1",
    "room-h-g7-2"
  ],
  "storage_ids": [
    "storage-h-g7-2-1"
  ],
  "routine_source": {
    "file": "apps/main/world/town/routines.ts",
    "export": "ROUTINES",
    "key": "コンラート"
  },
  "appearance_source": {
    "file": "apps/main/world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "コンラート"
  }
}
---

# コンラート

## 暮らしの立場

コンラートは衛兵（朝番）。衛兵の宿舎に属し、ヘンリケ、ロータルと暮らす。三交代で門と通りを見回り、給金は町の寄り合いから受け取る。夜明け前に門でロータルから番を受け、日が昇ってからヘンリケに渡す。

## 人柄と話し方

性格は早起き、生真面目、数を数える。話し方は「自分。きびきびした口調。「〜だ」」。口癖は「交代まであと少し」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。夜中に起きて支度し、朝番で門に立ち、昼過ぎに宿舎へ戻って夕餉をとって眠る。単に予定の座標へ移動できるだけで生活の成立としない。

## 固有の寝床

常用の寝床は [[room-h-g7-2]] の bed-h-g7-2-1 に割り当てる。二階の個室に本人の寝台を一つ持ち、眠る時刻の違う同僚と寝台を共用しない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。槍と兜、鉄の籠手は門の番の装備であり、帰宅すると槍は1階の槍立て、兜は戸口の棚へ置く。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。
