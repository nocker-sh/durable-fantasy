---
{
  "id": "room-inn-upper-stairs",
  "kind": "rooms",
  "title": "ゲルダの宿／2階 階段と寝具の保管",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-inn",
  "bed_capacity": 0,
  "occupants": [
    "ゲルダ",
    "ニーナ",
    "ゼップ"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "room_name": "2階 階段と寝具の保管",
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        10
      ],
      "width_cells": 2,
      "target": "room-inn-hall",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-inn-lower-stairs",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        3,
        1
      ],
      "target_access": [
        2,
        13
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "階段",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
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
          "activity": "階段を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "L",
      "name": "清潔な寝具の棚",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        1,
        15,
        2,
        3
      ],
      "access": [
        [
          3,
          15
        ]
      ],
      "use_space": [
        {
          "activity": "清潔な寝具の棚を使う",
          "rect": [
            3,
            15,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "Q",
      "name": "使用済み寝具の蓋付き受け",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        1,
        19,
        2,
        2
      ],
      "access": [
        [
          3,
          19
        ]
      ],
      "use_space": [
        {
          "activity": "使用済み寝具の蓋付き受けを使う",
          "rect": [
            3,
            19,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ゲルダ"
      ]
    }
  ],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-inn",
    "resident-ゲルダ"
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
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..D",
      "#SS..D",
      "#SS..#",
      "#....#",
      "#....#",
      "#LL..#",
      "#LL..#",
      "#LL..#",
      "#....#",
      "#QQ..#",
      "#QQ..#",
      "#....#",
      "#....#",
      "######"
    ]
  }
}
---
# ゲルダの宿／2階 階段と寝具の保管

## 用途と配置

[[building-inn]] の平面案に属する。階段から共用廊下へ出る。清潔な寝具と使用済みの受けは別に置き、客室の荷物の収納と混ぜない。階段で寝具を運ぶ身体、灯りと手摺、戸と頭上高を立体で照合する。

## 図面と未解決の生活

この平面は現行の自動配置を置き換えるための案であり、描画へはまだ反映しない。給排水・便所と洗濯、火気・換気、窓と梁、戸の操作、敷地・段差と生活の日課は未照合である。

```grid
######
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..D
#SS..D
#SS..#
#....#
#....#
#LL..#
#LL..#
#LL..#
#....#
#QQ..#
#QQ..#
#....#
#....#
######
```
