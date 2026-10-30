---
{
  "id": "room-inn-lower-stairs",
  "kind": "rooms",
  "title": "ゲルダの宿／1階 階段と寝具の受渡し",
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
  "floor": 0,
  "origin": [
    0,
    0
  ],
  "room_name": "1階 階段と寝具の受渡し",
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        10
      ],
      "width_cells": 2,
      "target": "room-inn-1",
      "target_door": [
        0,
        5
      ]
    },
    {
      "kind": "stair",
      "target": "room-inn-upper-stairs",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        2,
        13
      ],
      "target_access": [
        3,
        1
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
          2,
          13
        ]
      ],
      "use_space": [
        {
          "activity": "階段を使う",
          "rect": [
            1,
            13,
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
# ゲルダの宿／1階 階段と寝具の受渡し

## 用途と配置

[[building-inn]] の平面案に属する。食堂から入り、家庭の寝室や台所を通らず上階へ上がる。清潔な寝具と使用済みの受けを別の棚と容器へ分ける。洗濯場と干し場への経路、運ぶ量と重さ、同じ通路を使う時間の分離は未照合である。

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
