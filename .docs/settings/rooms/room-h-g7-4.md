---
{
  "id": "room-h-g7-4",
  "kind": "rooms",
  "title": "衛兵の宿舎／2階 ロータルの寝室",
  "status": "設計中",
  "source": "apps/main/world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g7",
  "floor": 1,
  "room_name": "ロータルの寝室",
  "use": "寝",
  "occupants": [
    "ロータル"
  ],
  "private_for": [
    "resident-ロータル"
  ],
  "bed_capacity": 1,
  "guest_capacity": 0,
  "sleeping_places": [
    {
      "id": "bed-h-g7-4-1",
      "resident": "resident-ロータル",
      "kind": "個別寝台",
      "storage_status": "本人の区画を割り当て。置き場と容量は未照合",
      "storage_id": "storage-h-g7-4-1"
    }
  ],
  "personal_storage": [
    {
      "id": "storage-h-g7-4-1",
      "resident": "resident-ロータル",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "compartment": "ロータルの区画"
    }
  ],
  "issues": [
    "寝台と衣服の区画の寸法・戸と窓・遮光と物音は未照合"
  ],
  "design_dependencies": [
    "building-h-g7",
    "resident-ロータル"
  ]
}
---

# 衛兵の宿舎／2階 ロータルの寝室

## 用途と暮らし

[[building-h-g7]]の2階にある夜番のロータルの個室で、本人の寝台を一つ持つ。夜明け前に門で番を渡して帰り、明け方から昼過ぎまで昼の光の中で眠る。廊下から直接入り、同僚の部屋を通らない。

## 未解決の条件

昼の睡眠のための遮光と物音、換気、衣服と首巻き・私物の区画の置き場は未照合である。
