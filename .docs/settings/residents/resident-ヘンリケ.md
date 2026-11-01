---
{
  "id": "resident-ヘンリケ",
  "kind": "residents",
  "title": "ヘンリケ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "watch",
  "buildings": [
    "building-h-g7"
  ],
  "bedroom_candidates": [
    "room-h-g7-3"
  ],
  "work": "衛兵（昼番）",
  "relationships": [
    {
      "a": "コンラート",
      "b": "ヘンリケ",
      "kind": "仕事仲間",
      "note": "朝番と昼番。門の前で番を渡す"
    },
    {
      "a": "ヘンリケ",
      "b": "ロータル",
      "kind": "仕事仲間",
      "note": "昼番と夜番"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h-g7-3",
  "bed_id": "bed-h-g7-3-1",
  "design_dependencies": [
    "building-h-g7",
    "room-h-g7-1",
    "room-h-g7-3"
  ],
  "storage_ids": [
    "storage-h-g7-3-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ヘンリケ"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ヘンリケ"
  }
}
---

# ヘンリケ

## 暮らしの立場

ヘンリケは衛兵（昼番）。衛兵の宿舎に属し、コンラート、ロータルと暮らす。三交代で門と通りを見回り、給金は町の寄り合いから受け取る。朝に門でコンラートから番を受け、夕方に広場でロータルへ渡す。

## 人柄と話し方

性格は堂々、面倒見がいい、子どもに人気。話し方は「あたし。はっきりした口調。「〜だよ」」。口癖は「見回りは足で覚える」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。朝に起きて門で番を受け、昼の広場を見回り、夕方に宿舎へ戻って夕餉をとって眠る。単に予定の座標へ移動できるだけで生活の成立としない。

## 固有の寝床

常用の寝床は [[room-h-g7-3]] の bed-h-g7-3-1 に割り当てる。二階の個室に本人の寝台を一つ持ち、眠る時刻の違う同僚と寝台を共用しない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。槍と兜、鉄の籠手は見回りの装備であり、帰宅すると槍は1階の槍立て、兜は戸口の棚へ置く。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。
