---
{
  "id": "resident-ロッテ",
  "kind": "residents",
  "title": "ロッテ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "tailor",
  "buildings": [
    "building-tailor"
  ],
  "bedroom_candidates": [
    "room-tailor-4"
  ],
  "work": "お針子",
  "relationships": [
    {
      "a": "マグダレーナ",
      "b": "ロッテ",
      "kind": "師弟",
      "note": "お針子。寸法を測る手つきが師に似てきた"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-tailor-4",
  "bed_id": "bed-tailor-4-1",
  "design_dependencies": [
    "building-tailor",
    "room-tailor-4",
    "room-tailor-1",
    "room-tailor-2",
    "room-tailor-5"
  ],
  "storage_ids": [
    "storage-tailor-4-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ロッテ"
  },
  "work_rooms": [
    "room-tailor-1",
    "room-tailor-2",
    "room-tailor-5"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ロッテ"
  }
}
---
# ロッテ



## 暮らしの立場

ロッテはお針子。仕立て屋のマグダレーナに属し、マグダレーナという世帯構成で暮らす。仕事と収入のつながりは服と首巻きの仕立て（お針子のロッテと）。毛は羊飼いから。

## 人柄と話し方

性格は器用、おしゃれ好き、夢見がち。話し方は「あたし。弾んだ若い女の子の口調」。口癖は「この色、似合うと思う」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-tailor-4]] の bed-tailor-4-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
