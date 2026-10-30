---
{
  "id": "resident-クレメンス",
  "kind": "residents",
  "title": "クレメンス",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "priest",
  "buildings": [
    "building-h10"
  ],
  "bedroom_candidates": [
    "room-h10-2"
  ],
  "work": "修道士の見習い",
  "relationships": [
    {
      "a": "ベネディクト",
      "b": "クレメンス",
      "kind": "師弟",
      "note": "記録の書き写しを任されて、字だけは師を越えた"
    }
  ],
  "issues": [
    "寝台・個人収納と食事の席を平面案へ配置。開閉・容量と描画は未照合",
    "礼拝堂の仕事場、給排水・便所・衣服と寝具の手入れ・日課は未照合"
  ],
  "bedroom": "room-h10-2",
  "bed_id": "bed-h10-2-2",
  "design_dependencies": [
    "building-h10",
    "room-h10-2",
    "room-h10-1",
    "building-chapel",
    "room-chapel-hall",
    "room-chapel-records",
    "room-chapel-care"
  ],
  "storage_ids": [
    "storage-h10-2-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "クレメンス"
  },
  "work_rooms": [
    "room-h10-1",
    "room-chapel-hall",
    "room-chapel-records",
    "room-chapel-care"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "クレメンス"
  }
}
---

# クレメンス

## 暮らしの立場

クレメンスは修道士の見習い。修道士ベネディクトと見習いに属し、ベネディクトという世帯構成で暮らす。仕事と収入のつながりは礼拝堂の務めと治癒、祈りの首飾りを彫る。寄り合いの寄進で粥を炊き、回復薬を煎じて道具屋に預ける。暮らしは寄り合いの寄進と治癒のお礼で立てる。

## 人柄と話し方

性格は真面目、迷いがち、字がきれい。話し方は「ぼく。丁寧語。考えながら話す」。口癖は「ベネディクトさまが言うには」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h10-2]] の bed-h10-2-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
