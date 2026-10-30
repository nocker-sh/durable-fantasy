---
{
  "id": "room-general-2",
  "kind": "rooms",
  "title": "ブルーノの道具屋／1階 奥の物置",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-general",
  "floor": 0,
  "room_name": "1階 奥の物置",
  "use": "貯蔵",
  "occupants": [
    "ブルーノ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######DD#####",
      "#AAA.....BBB#",
      "#AAA.....BBB#",
      "#AAA.....BBB#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#CCC.....QQQ#",
      "#CCC.....QQQ#",
      "#############"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        6,
        0
      ],
      "width_cells": 2,
      "target": "room-general-1",
      "target_door": [
        6,
        12
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "未開封の仕入品の棚",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        1,
        1,
        3,
        3
      ],
      "access": [
        [
          4,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "未開封の仕入品の棚を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "shop_stock"
    },
    {
      "symbol": "B",
      "name": "補充する道具の棚",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        9,
        1,
        3,
        3
      ],
      "access": [
        [
          8,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "補充する道具の棚を使う",
          "rect": [
            7,
            1,
            2,
            2
          ]
        }
      ],
      "role": "shop_stock"
    },
    {
      "symbol": "C",
      "name": "予備の縄と包みの棚",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        1,
        7,
        3,
        2
      ],
      "access": [
        [
          4,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "予備の縄と包みの棚を使う",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ],
      "role": "shop_stock"
    },
    {
      "symbol": "Q",
      "name": "空箱と返された品の受け",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        9,
        7,
        3,
        2
      ],
      "access": [
        [
          8,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "空箱と返された品の受けを使う",
          "rect": [
            7,
            7,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家、戸・窓・梁と地形は未照合",
    "商品の容量と重量・搬送、家庭の給排水と便所・火と灰、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-general",
    "resident-ブルーノ"
  ],
  "origin": [
    5,
    12
  ],
  "private_for": [
    "resident-ブルーノ"
  ]
}
---
# ブルーノの道具屋／1階 奥の物置

## 用途と暮らし

[[building-general]] の平面案に属する。仕入品と補充する商品、縄と包み、空箱と返された品を区別する。箱の中身が不明なまま食材や本人の衣服を商品と同じ棚へ置かない。箱の重量と搬入、返された品の検品と処理は未照合である。

## 未解決の条件

戸の開閉と視線・音、商品の量と容量、荷物を持つ身体と段差、火と煙・灰と換気、衣服と寝具の手入れ、仕事と休息・日課は未照合である。現行の建物の位置と描画は切り替えない。敷地と立体は建物資料へ結ぶ。

```grid
######DD#####
#AAA.....BBB#
#AAA.....BBB#
#AAA.....BBB#
#...........#
#...........#
#...........#
#CCC.....QQQ#
#CCC.....QQQ#
#############
```
