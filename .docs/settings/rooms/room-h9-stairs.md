---
{
  "id": "room-h9-stairs",
  "kind": "rooms",
  "title": "アウグストの家／2階 階段と共用通路",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h9",
  "bed_capacity": 0,
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "room_name": "階段と共用通路",
  "occupants": [
    "アウグスト",
    "ヘートヴィヒ",
    "ティム"
  ],
  "connections": [
    {
      "kind": "stair",
      "target": "room-h9-1",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        3,
        1
      ],
      "target_access": [
        3,
        12
      ]
    },
    {
      "kind": "door",
      "target": "room-h9-3",
      "door": [
        5,
        7
      ],
      "width_cells": 2,
      "target_door": [
        0,
        7
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "地上階とつながる直階段",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        1,
        1,
        2,
        12
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "地上階とつながる直階段を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "戸の開閉・窓・換気・火気と頭上高の立体は未照合",
    "給排水・便所・燃料と灰・収納容量・日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-h9"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..D",
      "#SS..D",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "######"
    ]
  }
}
---
# アウグストの家／2階 階段と共用通路

## 寝室を経由しない階段

階段の上端から共用の踊り場へ上がり、ティムの寝室へ入る。階段に毛糸や預かった灯りを積まない。世帯の誰でも階段と通路へ入れるが、客への売場として開放しない。

## 平面案

一セルは半メートル。戸口は共有壁の同じ位置へ合わせる。

```grid
######
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..D
#SS..D
#SS..#
#SS..#
#SS..#
#SS..#
#....#
#....#
#....#
#....#
#....#
#....#
######
```
