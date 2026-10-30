---
{
  "id": "resident-ゼップ",
  "kind": "residents",
  "title": "ゼップ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "inn",
  "buildings": [
    "building-inn"
  ],
  "bedroom_candidates": [
    "room-inn-4"
  ],
  "work": "宿の料理番",
  "relationships": [
    {
      "a": "ゲルダ",
      "b": "ゼップ",
      "kind": "仕事仲間",
      "note": "宿の台所を二十年まかされている。ゲルダは味見しかしない"
    },
    {
      "a": "ニーナ",
      "b": "ゼップ",
      "kind": "仕事仲間",
      "note": "給仕と料理番。余った甘いものを分け合う"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-inn-4",
  "bed_id": "bed-inn-4-1",
  "design_dependencies": [
    "building-inn",
    "room-inn-4"
  ],
  "storage_ids": [
    "storage-inn-4-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ゼップ"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ゼップ"
  }
}
---

# ゼップ

## 暮らしの立場

ゼップは宿の料理番。宿のゲルダとニーナに属し、ゲルダ、ニーナという世帯構成で暮らす。仕事と収入のつながりは宿と食堂。野菜と魚は市場から。娘のニーナが給仕、ゼップが台所。

## 人柄と話し方

性格は無口、腕のいい料理番、甘党。話し方は「おれ。ぼそぼそと短く。「……うまいぞ」」。口癖は「煮込みは急がない」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-inn-4]] の bed-inn-4-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
