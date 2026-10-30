---
{
  "id": "resident-リーゼル",
  "kind": "residents",
  "title": "リーゼル",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "well",
  "buildings": [
    "building-h4"
  ],
  "bedroom_candidates": [
    "room-h4-2"
  ],
  "work": "水汲み",
  "relationships": [
    {
      "a": "ヘレナ",
      "b": "リーゼル",
      "kind": "親子",
      "note": "母一人娘一人。リーゼルの父のことは話さない"
    },
    {
      "a": "ハンス",
      "b": "リーゼル",
      "kind": "幼なじみ",
      "note": "朝、井戸と店先で顔を合わせる。ハンスは何か言いかけてやめる"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "service_roles": [
    {
      "facility": "facility-square-well",
      "role": "水汲みと湯売り",
      "scope": "本人の日課内。町全体の常時配水を担わない"
    }
  ],
  "bedroom": "room-h4-2",
  "bed_id": "bed-h4-2-2",
  "design_dependencies": [
    "building-h4",
    "room-h4-2",
    "facility-h4-garden"
  ],
  "storage_ids": [
    "storage-h4-2-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "リーゼル"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "リーゼル"
  }
}
---

# リーゼル

## 暮らしの立場

リーゼルは水汲み。ヘレナと娘のリーゼルに属し、ヘレナという世帯構成で暮らす。仕事と収入のつながりはヘレナは繕い物、リーゼルは水汲み。

## 人柄と話し方

性格はしっかり者、我慢強い、少し寂しがり。話し方は「わたし。素朴な丁寧語まじり」。口癖は「水は重いなあ」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 水を運ぶ仕事の範囲

[[facility-square-well]] を使い、水汲みと湯売りを行う。母の手伝い、食事と就寝も持つため、全地区と全世帯へ常時水を配る役にはしない。井戸へ自分で汲みに来る住民と、水運びを頼む相手を区別する。運ぶ容器、家の水の保管、湯売りの加熱場所と空き容器の戻り先を次の配置で決める。

## 固有の寝床

常用の寝床は [[room-h4-2]] の bed-h4-2-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。
