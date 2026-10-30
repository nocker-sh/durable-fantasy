---
{
  "id": "room-crystal-2",
  "kind": "rooms",
  "title": "コンスタンティンの結晶屋／1階 金庫室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-crystal",
  "floor": 0,
  "room_name": "金庫室",
  "use": "貯蔵",
  "occupants": [
    "コンスタンティン"
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
      "target": "room-crystal-1",
      "target_door": [
        6,
        12
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "商売の金庫",
      "owner": "コンスタンティン",
      "source": "鍛冶場へ収納箱と錠の製作を頼む案。耐火性と防犯性能・据付は未照合。コンスタンティンが手入れする案",
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
          "activity": "商売の金庫を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "work_storage",
      "maintainers": [
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "B",
      "name": "仕入れた結晶の箱を置く棚",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
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
          "activity": "仕入れた結晶の箱を置く棚を使う",
          "rect": [
            7,
            1,
            2,
            2
          ]
        }
      ],
      "role": "work_storage",
      "maintainers": [
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "C",
      "name": "仕入れと在庫の帳簿棚",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
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
          "activity": "仕入れと在庫の帳簿棚を使う",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ],
      "role": "work_storage",
      "maintainers": [
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "Q",
      "name": "空の包みと梱包材の棚",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
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
          "activity": "空の包みと梱包材の棚を使う",
          "rect": [
            7,
            7,
            2,
            2
          ]
        }
      ],
      "role": "work_storage",
      "maintainers": [
        "resident-コンスタンティン"
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "結晶の保管と仕入れ・計量・防犯、家庭の給排水と便所・火と灰、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-crystal",
    "resident-コンスタンティン"
  ],
  "origin": [
    5,
    12
  ],
  "private_for": [
    "resident-コンスタンティン"
  ]
}
---
# コンスタンティンの結晶屋／1階 金庫室

## 用途と暮らし

[[building-crystal]] の平面案に属する。金庫と仕入れた結晶、仕入れ帳、空の包みと梱包材を分ける。本人だけの仕事の区画とし、客の通り抜けに使わない。金庫の据付・床の強さ・錠と防犯、在庫の量と保管条件は未照合である。

## 未解決の条件

戸と窓・視線と音、結晶の仕入れと搬送・保管条件、錠と計量・商品の量、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

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
