---
{
  "id": "resident-ルドルフ",
  "kind": "residents",
  "title": "ルドルフ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "leather",
  "buildings": [
    "building-leather"
  ],
  "bedroom_candidates": [
    "room-leather-3"
  ],
  "work": "革職人",
  "relationships": [
    {
      "a": "ラインホルト",
      "b": "ルドルフ",
      "kind": "友人",
      "note": "毛皮の卸しで四十年。言葉はいらない"
    },
    {
      "a": "ルドルフ",
      "b": "ゴットフリート",
      "kind": "ぎこちない",
      "note": "若い頃に仕事を取り合った。今は通りで会えば会釈だけする"
    },
    {
      "a": "ファルク",
      "b": "ルドルフ",
      "kind": "取引相手",
      "note": "皮をルドルフへ。なめしの出来に、ファルクは何も言わない"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-leather-3",
  "bed_id": "bed-leather-3-1",
  "design_dependencies": [
    "building-leather",
    "room-leather-3",
    "room-leather-1",
    "room-leather-2"
  ],
  "storage_ids": [
    "storage-leather-3-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ルドルフ"
  },
  "work_rooms": [
    "room-leather-1",
    "room-leather-2"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ルドルフ"
  }
}
---
# ルドルフ


## 暮らしの立場

ルドルフは革職人。革職人のルドルフに属し、同居人なしという世帯構成で暮らす。仕事と収入のつながりは革なめしと革細工。獣の皮はファルクから、羊の皮はマティアスから。冬毛は買取屋から靴の内張り用に。

## 人柄と話し方

性格は頑固、根は優しい、手仕事の人。話し方は「わし。職人の老人。「〜だぞ」」。口癖は「手間をかけた分だけ」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-leather-3]] の bed-leather-3-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
