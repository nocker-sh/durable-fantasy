---
{
  "id": "resident-ギュンター",
  "kind": "residents",
  "title": "ギュンター",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "smith",
  "buildings": [
    "building-smithy"
  ],
  "bedroom_candidates": [
    "room-smithy-2"
  ],
  "work": "鍛冶屋",
  "relationships": [
    {
      "a": "ギュンター",
      "b": "ペーター",
      "kind": "師弟",
      "note": "親方は厳しいが、見習いの火傷にはすぐ薬を塗ってやる"
    },
    {
      "a": "ギュンター",
      "b": "ベアトリクス",
      "kind": "仕事仲間",
      "note": "剣と鎧。共同の炉の使い方でたまに言い合う"
    },
    {
      "a": "ヨーゼフ",
      "b": "ギュンター",
      "kind": "取引相手",
      "note": "炭の焼き加減に、ギュンターは文句をつけたことがない"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-smithy-2",
  "bed_id": "bed-smithy-2-1",
  "design_dependencies": [
    "building-smithy",
    "room-smithy-2",
    "room-smithy-1",
    "facility-square-pasture"
  ],
  "storage_ids": [
    "storage-smithy-2-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ギュンター"
  },
  "work_rooms": [
    "room-smithy-1"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ギュンター"
  }
}
---
# ギュンター

## 暮らしの立場

ギュンターは鍛冶屋。鍛冶屋のギュンターと見習いに属し、ペーターという世帯構成で暮らす。仕事と収入のつながりは鍛冶。炭は木こりのヨーゼフが焼き、鉄はラインホルトが買い取る古い鉄くずと鍋から。大物を打つときだけ職人通りの共同の炉を借りる。

## 人柄と話し方

性格は職人気質、ぶっきらぼう、面倒見がいい。話し方は「俺。短く言い切る。「〜だ」「〜だぜ」。相手は「あんた」」。口癖は「鉄は熱いうちに打て」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-smithy-2]] の bed-smithy-2-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。


## 牧草地の門の製作の案

[[facility-square-pasture]] の門の蝶番と掛金・補強の金具の製作を頼まれる案を持つ。原材料と量・加工と接合、重さと支持、作業時間・納期と費用は未確定であり、現行の在庫・製作と日課には組み込まない。
