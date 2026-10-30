---
{
  "id": "resident-オイゲン",
  "kind": "residents",
  "title": "オイゲン",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "guards",
  "buildings": [
    "building-guardhouse"
  ],
  "bedroom_candidates": [
    "room-guardhouse-3"
  ],
  "work": "門番",
  "relationships": [
    {
      "a": "オイゲン",
      "b": "ディーター",
      "kind": "仕事仲間",
      "note": "昼番と夜番。夕方の交代のときにだけ顔を合わせる"
    },
    {
      "a": "オイゲン",
      "b": "ヴェロニカ",
      "kind": "仕事仲間",
      "note": "昼番の二人。交代で門に立つ"
    },
    {
      "a": "オイゲン",
      "b": "シュテファン",
      "kind": "仕事仲間",
      "note": "門の引き継ぎで顔を合わせる"
    },
    {
      "a": "エドガー",
      "b": "オイゲン",
      "kind": "師弟",
      "note": "門番の心得を教えたのはエドガー"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-guardhouse-3",
  "bed_id": "bed-guardhouse-3-1",
  "design_dependencies": [
    "building-guardhouse",
    "room-guardhouse-1",
    "room-guardhouse-gear",
    "room-guardhouse-3"
  ],
  "storage_ids": [
    "storage-guardhouse-3-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "オイゲン"
  },
  "work_rooms": [
    "room-guardhouse-1",
    "room-guardhouse-gear"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "オイゲン"
  }
}
---
# オイゲン


## 暮らしの立場

オイゲンは門番。門の詰所（衛兵）に属し、ディーター、シュテファン、ヴェロニカという世帯構成で暮らす。仕事と収入のつながりは町の警備と、夕方の街灯点け（油は道具屋から）。給金は町の寄り合いから。

## 人柄と話し方

性格は真面目、心配性、昼型。話し方は「おれ。門番らしいきびきびした口調」。口癖は「日が暮れる前に」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-guardhouse-3]] の bed-guardhouse-3-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
