---
{
  "id": "resident-ヴァルター",
  "kind": "residents",
  "title": "ヴァルター",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "farm",
  "buildings": [
    "building-barn",
    "building-farmhouse",
    "building-coop"
  ],
  "bedroom_candidates": [
    "room-farmhouse-5"
  ],
  "work": "作男",
  "relationships": [
    {
      "a": "カール",
      "b": "ヴァルター",
      "kind": "仕事仲間",
      "note": "住み込みの作男。カールより先に畑に出る"
    },
    {
      "a": "ヴァルター",
      "b": "ウルリケ",
      "kind": "仕事仲間",
      "note": "おかみさんの焼き芋の味見役"
    }
  ],
  "issues": [
    "寝台・個人収納と食事の席を平面案へ配置。開閉・容量と描画は未照合",
    "畑と家畜の仕事場、給排水・便所・衣服と寝具の手入れ・日課は未照合"
  ],
  "bedroom": "room-farmhouse-5",
  "bed_id": "bed-farmhouse-5-1",
  "design_dependencies": [
    "building-barn",
    "building-farmhouse",
    "building-coop",
    "room-farmhouse-5",
    "room-farmhouse-1",
    "room-farmhouse-stairs",
    "room-barn-1",
    "room-barn-2",
    "facility-square-pasture"
  ],
  "storage_ids": [
    "storage-farmhouse-5-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ヴァルター"
  },
  "work_rooms": [
    "room-barn-1",
    "room-barn-2"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ヴァルター"
  }
}
---
# ヴァルター

## 暮らしの立場

ヴァルターは作男。農家のカールとウルリケに属し、カール、ウルリケ、フリッツ、ミア、ゲルトルートという世帯構成で暮らす。仕事と収入のつながりはライ麦と小麦、キャベツ、芋、鶏と豚、巣箱の蜜。麦はカールが風車で挽いて粉にする。町の食料の出どころ。

## 人柄と話し方

性格は力持ち、素朴、よく食べる。話し方は「おら。のんびりした口調。「〜だべ」は使わず「〜だなあ」」。口癖は「腹が減っては」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-farmhouse-5]] の bed-farmhouse-5-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。


## 居住と作業の区別

work_rooms は仕事の区画を示し、寝床は bedroom と bed_id の割当に維持する。通いの仕事場の所属から第二の寝床を推定しない。搬入と片付け・衣服の手入れ、食事と帰宅、各作業に費やす時間を日課へ照合してから描画へ渡す。


## 牧草地の手入れの案

[[facility-square-pasture]] の給水と羊の見回り・柵の手入れを農家の仕事へ結ぶ案にする。現行の日課へ追加済みとはせず、家事と食事・休息、納屋と畑の仕事との時間と荷物、給水量と餌・糞の回収と手入れの量を照合する。入口の棒を修正したことを、閉じた門と逸走防止・飼育の一日の成立へ広げない。
