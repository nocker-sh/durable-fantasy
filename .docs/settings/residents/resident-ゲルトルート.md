---
{
  "id": "resident-ゲルトルート",
  "kind": "residents",
  "title": "ゲルトルート",
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
    "room-farmhouse-4"
  ],
  "work": "糸紡ぎ",
  "relationships": [
    {
      "a": "ゲルトルート",
      "b": "ウルリケ",
      "kind": "親子",
      "note": "娘の家に身を寄せた母。糸車はずっと回っている"
    },
    {
      "a": "ゲルトルート",
      "b": "フリッツ",
      "kind": "祖母と孫",
      "note": ""
    },
    {
      "a": "ゲルトルート",
      "b": "ミア",
      "kind": "祖母と孫",
      "note": "ミアにだけ糸車を触らせる"
    },
    {
      "a": "ゲルトルート",
      "b": "カール",
      "kind": "仕事仲間",
      "note": "婿と姑。畑のことでは口を出さない約束"
    }
  ],
  "issues": [
    "寝台・個人収納と食事の席を平面案へ配置。開閉・容量と描画は未照合",
    "畑と家畜の仕事場、給排水・便所・衣服と寝具の手入れ・日課は未照合"
  ],
  "bedroom": "room-farmhouse-4",
  "bed_id": "bed-farmhouse-4-1",
  "design_dependencies": [
    "building-barn",
    "building-farmhouse",
    "building-coop",
    "room-farmhouse-4",
    "room-farmhouse-1",
    "room-farmhouse-stairs"
  ],
  "storage_ids": [
    "storage-farmhouse-4-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ゲルトルート"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ゲルトルート"
  }
}
---

# ゲルトルート

## 暮らしの立場

ゲルトルートは糸紡ぎ。農家のカールとウルリケに属し、カール、ウルリケ、フリッツ、ミア、ヴァルターという世帯構成で暮らす。仕事と収入のつながりはライ麦と小麦、キャベツ、芋、鶏と豚、巣箱の蜜。麦はカールが風車で挽いて粉にする。町の食料の出どころ。

## 人柄と話し方

性格は気丈、孫に甘い、昔語り。話し方は「あたしゃ。田舎のおばあさん言葉。「〜だよ」「〜さね」」。口癖は「糸は切らさないことさね」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-farmhouse-4]] の bed-farmhouse-4-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
