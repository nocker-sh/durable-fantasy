---
{
  "id": "resident-カール",
  "kind": "residents",
  "title": "カール",
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
    "room-farmhouse-2"
  ],
  "work": "農夫",
  "relationships": [
    {
      "a": "カール",
      "b": "ウルリケ",
      "kind": "夫婦",
      "note": "口数の少ない夫と朗らかな妻"
    },
    {
      "a": "カール",
      "b": "フリッツ",
      "kind": "親子",
      "note": "父の背中を見て育つ。衛兵に憧れているのを父は少し寂しく思う"
    },
    {
      "a": "カール",
      "b": "ミア",
      "kind": "親子",
      "note": ""
    },
    {
      "a": "ゲルトルート",
      "b": "カール",
      "kind": "仕事仲間",
      "note": "婿と姑。畑のことでは口を出さない約束"
    },
    {
      "a": "カール",
      "b": "ヴァルター",
      "kind": "仕事仲間",
      "note": "住み込みの作男。カールより先に畑に出る"
    }
  ],
  "issues": [
    "寝台・個人収納と食事の席を平面案へ配置。開閉・容量と描画は未照合",
    "畑と家畜の仕事場、給排水・便所・衣服と寝具の手入れ・日課は未照合"
  ],
  "bedroom": "room-farmhouse-2",
  "bed_id": "bed-farmhouse-2-1",
  "design_dependencies": [
    "building-barn",
    "building-farmhouse",
    "building-coop",
    "room-farmhouse-2",
    "room-farmhouse-1",
    "room-farmhouse-stairs",
    "room-barn-1",
    "room-barn-2",
    "facility-square-pasture",
    "facility-square-windmill"
  ],
  "storage_ids": [
    "storage-farmhouse-2-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "カール"
  },
  "work_rooms": [
    "room-barn-1",
    "room-barn-2"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "カール"
  }
}
---
# カール

## 暮らしの立場

カールは農夫。農家のカールとウルリケに属し、ウルリケ、フリッツ、ミア、ゲルトルート、ヴァルターという世帯構成で暮らす。仕事と収入のつながりはライ麦と小麦、キャベツ、芋、鶏と豚、巣箱の蜜。麦はカールが風車で挽いて粉にする。町の食料の出どころ。

## 人柄と話し方

性格は寡黙、辛抱強い、空ばかり見る。話し方は「おれ。ゆっくり話す。「〜だな」」。口癖は「空模様が」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-farmhouse-2]] の bed-farmhouse-2-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。


## 居住と作業の区別

work_rooms は仕事の区画を示し、寝床は bedroom と bed_id の割当に維持する。通いの仕事場の所属から第二の寝床を推定しない。搬入と片付け・衣服の手入れ、食事と帰宅、各作業に費やす時間を日課へ照合してから描画へ渡す。


## 牧草地の手入れの案

[[facility-square-pasture]] の給水と羊の見回り・柵の手入れを農家の仕事へ結ぶ案にする。現行の日課へ追加済みとはせず、家事と食事・休息、納屋と畑の仕事との時間と荷物、給水量と餌・糞の回収と手入れの量を照合する。入口の棒を修正したことを、閉じた門と逸走防止・飼育の一日の成立へ広げない。
