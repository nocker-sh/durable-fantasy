---
{
  "id": "resident-ニーナ",
  "kind": "residents",
  "title": "ニーナ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "inn",
  "buildings": [
    "building-inn"
  ],
  "bedroom_candidates": [
    "room-inn-3"
  ],
  "work": "宿の給仕",
  "relationships": [
    {
      "a": "ゲルダ",
      "b": "ニーナ",
      "kind": "親子",
      "note": "母の宿を手伝う娘。叱られ方まで母に似てきた"
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
  "bedroom": "room-inn-3",
  "bed_id": "bed-inn-3-2",
  "design_dependencies": [
    "building-inn",
    "room-inn-3"
  ],
  "storage_ids": [
    "storage-inn-3-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ニーナ"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ニーナ"
  }
}
---

# ニーナ

## 暮らしの立場

ニーナは宿の給仕。宿のゲルダとニーナに属し、ゲルダ、ゼップという世帯構成で暮らす。仕事と収入のつながりは宿と食堂。野菜と魚は市場から。娘のニーナが給仕、ゼップが台所。

## 人柄と話し方

性格はてきぱき、母似、耳ざとい。話し方は「あたし。明るい給仕の口調。「〜ですよ！」」。口癖は「はい、ただいま」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-inn-3]] の bed-inn-3-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
