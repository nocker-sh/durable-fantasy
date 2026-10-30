---
{
  "id": "room-bakery-landing",
  "kind": "rooms",
  "title": "マルタのパン屋／二階 共用踊り場",
  "status": "設計中",
  "source": "rooms/room-bakery-1.md",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-bakery",
  "floor": 1,
  "room_name": "共用踊り場",
  "use": "通行",
  "occupants": [
    "マルタ",
    "ハンス",
    "ローザ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###DD#####DD#",
      "#SS.........#",
      "#SS.........#",
      "#SS.........#",
      "#SS.........#",
      "#SS.........#",
      "#############"
    ],
    "legend": {
      "#": "壁",
      ".": "通路・使用面",
      "D": "寝間への戸口",
      "S": "階段開口"
    }
  },
  "connections": [
    {
      "kind": "stair",
      "furniture": "S",
      "target": "room-bakery-1",
      "target_furniture": "S",
      "access": [
        3,
        1
      ],
      "target_access": [
        3,
        6
      ]
    },
    {
      "kind": "door",
      "door": [
        3,
        0
      ],
      "target": "room-bakery-3",
      "target_door": [
        3,
        13
      ],
      "width_cells": 2
    },
    {
      "kind": "door",
      "door": [
        10,
        0
      ],
      "target": "room-bakery-4",
      "target_door": [
        3,
        13
      ],
      "width_cells": 2
    }
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "家族用階段の開口と手すり",
      "owner": "bakers",
      "source": "大工への造作依頼",
      "rect": [
        1,
        1,
        2,
        5
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "階段を上がり切って向きを変える",
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
    "階段の頭上高・手すり・開口の立体照合未完了",
    "戸の開閉域と二人のすれ違いの照合未完了"
  ],
  "origin": [
    0,
    13
  ],
  "design_dependencies": [
    "building-bakery",
    "room-bakery-1",
    "room-bakery-3",
    "room-bakery-4"
  ]
}
---

# マルタのパン屋／二階 共用踊り場

## 使い方

階段の上端から東側へ出て、左右の寝間へ進む。ハンスが早朝に仕事へ降りる際、マルタとローザの寝間を通らない。寝間の戸は北側に二つあり、どちらからも階段上端へ歩ける。衣装箱や荷物を置かず、階段の開口と通路を区別する。

## グリッド

```grid
###DD#####DD#
#SS.........#
#SS.........#
#SS.........#
#SS.........#
#SS.........#
#############
```

一セルは半メートル。S は上階の床を抜いた階段の占有で、歩ける床ではない。上端の使用面は東側に置く。上下の階段占有は建物の共通座標で一致させる。開口の周囲には手すりを付け、階段上端へ抜ける東側だけ開ける。

## 未解決の条件

平面の接続は定義したが、頭上高、踏面、蹴上げ、手すりと戸の可動域は立体での検査が残る。描画への通過条件は満たしていない。
