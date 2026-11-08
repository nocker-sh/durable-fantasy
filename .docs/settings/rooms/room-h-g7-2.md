---
{
  "id": "room-h-g7-2",
  "kind": "rooms",
  "title": "衛兵の宿舎／2階 コンラートの寝室",
  "status": "設計中",
  "source": "apps/main/world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g7",
  "floor": 1,
  "room_name": "コンラートの寝室",
  "use": "寝",
  "occupants": [
    "コンラート"
  ],
  "private_for": [
    "resident-コンラート"
  ],
  "bed_capacity": 1,
  "guest_capacity": 0,
  "sleeping_places": [
    {
      "id": "bed-h-g7-2-1",
      "resident": "resident-コンラート",
      "kind": "個別寝台",
      "storage_status": "本人の区画を割り当て。置き場と容量は未照合",
      "storage_id": "storage-h-g7-2-1"
    }
  ],
  "personal_storage": [
    {
      "id": "storage-h-g7-2-1",
      "resident": "resident-コンラート",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "compartment": "コンラートの区画"
    }
  ],
  "issues": [
    "寝台と衣服の区画の寸法・戸と窓・遮光と物音は未照合"
  ],
  "design_dependencies": [
    "building-h-g7",
    "resident-コンラート"
  ]
}
---

# 衛兵の宿舎／2階 コンラートの寝室

## 用途と暮らし

[[building-h-g7]]の2階にある朝番のコンラートの個室で、本人の寝台を一つ持つ。夜中の二時半に起きて門へ出るため、昼過ぎから眠る。同僚と眠る時刻が重ならないので部屋を分け、廊下から直接入る。

## 未解決の条件

昼の光を遮る窓の覆い、階下の物音と換気、衣服と首巻き・私物の区画の置き場は未照合である。
