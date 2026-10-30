---
{
  "id": "resident-フランツ",
  "kind": "residents",
  "title": "フランツ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "tavern",
  "buildings": [
    "building-tavern",
    "building-h-m3"
  ],
  "bedroom_candidates": [
    "room-tavern-3"
  ],
  "work": "酒場の主人",
  "relationships": [
    {
      "a": "ヤコブ",
      "b": "フランツ",
      "kind": "取引相手",
      "note": "酒場の魚のスープはヤコブの浜の魚"
    },
    {
      "a": "オットー",
      "b": "フランツ",
      "kind": "取引相手",
      "note": "ぶどうを醸造所へ。出来の悪い年もフランツは全部買う"
    },
    {
      "a": "フランツ",
      "b": "ヨーゼフ",
      "kind": "友人",
      "note": "開けたばかりの夕方の酒場で、二人は黙って飲む。ヨーゼフは早く寝る"
    },
    {
      "a": "フランツ",
      "b": "リリー",
      "kind": "仕事仲間",
      "note": "酒場の給仕。客の好みはフランツより覚えている"
    },
    {
      "a": "フランツ",
      "b": "マックス",
      "kind": "師弟",
      "note": "醸造を教わる若者。仕込みの日だけは真面目になる"
    },
    {
      "a": "アントン",
      "b": "フランツ",
      "kind": "取引相手",
      "note": "醸造所の樽はアントンが組む"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-tavern-3",
  "bed_id": "bed-tavern-3-1",
  "design_dependencies": [
    "building-tavern",
    "building-h-m3",
    "room-tavern-3",
    "room-tavern-1",
    "room-tavern-2",
    "room-h-m3-1",
    "room-h-m3-2"
  ],
  "storage_ids": [
    "storage-tavern-3-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "フランツ"
  },
  "work_rooms": [
    "room-tavern-1",
    "room-tavern-2",
    "room-h-m3-1",
    "room-h-m3-2"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "フランツ"
  }
}
---

# フランツ

## 暮らしの立場

フランツは酒場の主人。酒場のフランツに属し、リリー、マックスという世帯構成で暮らす。仕事と収入のつながりは酒場。酒は醸造所で自分で仕込む。給仕のリリーと、醸造の手伝いのマックスが住み込み。

## 人柄と話し方

性格は聞き上手、粋、酒にうるさい。話し方は「俺。落ち着いた低い声。「〜だろう」」。口癖は「旅の話を聞かせてくれ」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-tavern-3]] の bed-tavern-3-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。


## 居住と作業の区別

work_rooms は仕事の区画を示し、寝床は bedroom と bed_id の割当に維持する。通いの仕事場の所属から第二の寝床を推定しない。搬入と片付け・衣服の手入れ、食事と帰宅、各作業に費やす時間を日課へ照合してから描画へ渡す。
