---
{
  "id": "room-h-g8-2",
  "kind": "rooms",
  "title": "インゴとカルラの家／2階 インゴとカルラの寝室",
  "status": "設計中",
  "source": "apps/main/world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g8",
  "floor": 1,
  "room_name": "インゴとカルラの寝室",
  "use": "寝",
  "occupants": [
    "インゴ",
    "カルラ"
  ],
  "private_for": [
    "resident-インゴ",
    "resident-カルラ"
  ],
  "bed_capacity": 2,
  "guest_capacity": 0,
  "sleeping_places": [
    {
      "id": "bed-h-g8-2-1",
      "resident": "resident-インゴ",
      "kind": "個別寝台",
      "storage_status": "本人の区画を割り当て。置き場と容量は未照合",
      "storage_id": "storage-h-g8-2-1"
    },
    {
      "id": "bed-h-g8-2-2",
      "resident": "resident-カルラ",
      "kind": "個別寝台",
      "storage_status": "本人の区画を割り当て。置き場と容量は未照合",
      "storage_id": "storage-h-g8-2-2"
    }
  ],
  "personal_storage": [
    {
      "id": "storage-h-g8-2-1",
      "resident": "resident-インゴ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "compartment": "インゴの区画"
    },
    {
      "id": "storage-h-g8-2-2",
      "resident": "resident-カルラ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "compartment": "カルラの区画"
    }
  ],
  "issues": [
    "二人用の寝台と衣服の区画の寸法・戸と窓は未照合"
  ],
  "design_dependencies": [
    "building-h-g8",
    "resident-インゴ",
    "resident-カルラ"
  ]
}
---

# インゴとカルラの家／2階 インゴとカルラの寝室

## 用途と暮らし

[[building-h-g8]]の2階にある夫婦の寝室で、二人用の寝台を一つ置き、インゴとカルラがそれぞれの側で眠る。二人は同じ時刻に起きて眠るので一つの寝台を分け合い、弟の部屋とは壁で分ける。

## 未解決の条件

窓と戸の建て付け、二人の衣服と首巻き・私物の区画の置き場と容量は未照合である。
