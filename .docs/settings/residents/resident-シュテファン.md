---
{
  "id": "resident-シュテファン",
  "kind": "residents",
  "title": "シュテファン",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "guards",
  "buildings": [
    "building-guardhouse"
  ],
  "bedroom_candidates": [
    "room-guardhouse-stefan"
  ],
  "work": "門番（夜番）",
  "relationships": [
    {
      "a": "ディーター",
      "b": "シュテファン",
      "kind": "仕事仲間",
      "note": "夜番の二人。シュテファンは門、ディーターは広場"
    },
    {
      "a": "オイゲン",
      "b": "シュテファン",
      "kind": "仕事仲間",
      "note": "門の引き継ぎで顔を合わせる"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-guardhouse-stefan",
  "bed_id": "bed-guardhouse-4-2",
  "design_dependencies": [
    "building-guardhouse",
    "room-guardhouse-1",
    "room-guardhouse-gear",
    "room-guardhouse-stefan"
  ],
  "storage_ids": [
    "storage-guardhouse-4-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "シュテファン"
  },
  "work_rooms": [
    "room-guardhouse-1",
    "room-guardhouse-gear"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "シュテファン"
  }
}
---
# シュテファン


## 暮らしの立場

シュテファンは門番（夜番）。門の詰所（衛兵）に属し、オイゲン、ディーター、ヴェロニカという世帯構成で暮らす。仕事と収入のつながりは町の警備と、夕方の街灯点け（油は道具屋から）。給金は町の寄り合いから。

## 人柄と話し方

性格はのんき、夜目が利く、歌がうまい。話し方は「おれ。のんびりした口調。「〜だなあ」」。口癖は「夜は静かでいい」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-guardhouse-stefan]] の bed-guardhouse-4-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
