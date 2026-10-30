---
{
  "id": "room-general-household",
  "kind": "rooms",
  "title": "ブルーノの道具屋／2階 台所と食事",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-general",
  "bed_capacity": 0,
  "occupants": [
    "ブルーノ"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    11
  ],
  "room_name": "2階 台所と食事",
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        3
      ],
      "width_cells": 2,
      "target": "room-general-upper-stairs",
      "target_door": [
        5,
        14
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        1,
        1,
        3,
        2
      ],
      "access": [
        [
          1,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の下ごしらえ台を使う",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "O",
      "name": "家庭の調理炉",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        5,
        1,
        2,
        2
      ],
      "access": [
        [
          5,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の調理炉を使う",
          "rect": [
            5,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "N",
      "name": "家庭の食材棚",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        9,
        1,
        3,
        2
      ],
      "access": [
        [
          9,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            9,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "家庭の洗い台",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        1,
        6,
        3,
        1
      ],
      "access": [
        [
          4,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の洗い台を使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "一人の食卓",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        7,
        5,
        3,
        2
      ],
      "access": [
        [
          7,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "一人の食卓を使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "B"
      ],
      "role": "table"
    },
    {
      "symbol": "B",
      "name": "ブルーノの食事の椅子",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        6,
        5,
        1,
        1
      ],
      "access": [
        [
          5,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "ブルーノの食事の椅子を使う",
          "rect": [
            4,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat"
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
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ブルーノ",
        "chair": "B"
      }
    ]
  },
  "private_for": [
    "resident-ブルーノ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#KKK.OO..NNN#",
      "#KKK.OO..NNN#",
      "D...........#",
      "D...........#",
      "#.....BTTT..#",
      "#WWW...TTT..#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#############"
    ]
  }
}
---
# ブルーノの道具屋／2階 台所と食事

## 用途と暮らし

[[building-general]] の平面案に属する。上階の家庭の食材・下ごしらえ・調理・洗い台と一人の食事の席を持つ。売り物の道具と自分の食器、給水と食材の搬送、仕事の後の片付けを分ける。

## 未解決の条件

戸の開閉と視線・音、商品の量と容量、荷物を持つ身体と段差、火と煙・灰と換気、衣服と寝具の手入れ、仕事と休息・日課は未照合である。現行の建物の位置と描画は切り替えない。敷地と立体は建物資料へ結ぶ。

```grid
#############
#KKK.OO..NNN#
#KKK.OO..NNN#
D...........#
D...........#
#.....BTTT..#
#WWW...TTT..#
#...........#
#...........#
#...........#
#############
```
