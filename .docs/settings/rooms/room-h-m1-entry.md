---
{
  "id": "room-h-m1-entry",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-m1",
  "bed_capacity": 0,
  "title": "エーリヒの家／1階 家庭と依頼の入口",
  "room_name": "1階 家庭と依頼の入口",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    14
  ],
  "use": "生活",
  "occupants": [
    "エーリヒ",
    "マリー",
    "ハンナ"
  ],
  "furniture": [
    {
      "symbol": "Q",
      "name": "外套と荷の受け",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        7,
        1,
        3,
        2
      ],
      "access": [
        [
          6,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "外套と荷の受けを使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "R",
      "name": "靴と泥の受け",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        1,
        4,
        2,
        2
      ],
      "access": [
        [
          3,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "靴と泥の受けを使う",
          "rect": [
            3,
            4,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "帰宅時の手洗い台",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        7,
        5,
        3,
        2
      ],
      "access": [
        [
          6,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "帰宅時の手洗い台を使う",
          "rect": [
            5,
            5,
            2,
            2
          ]
        }
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        7
      ],
      "width_cells": 2,
      "target": "map-phanthiet-market"
    },
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-m1-office",
      "target_door": [
        4,
        14
      ]
    },
    {
      "kind": "door",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-h-m1-lower-stairs",
      "target_door": [
        5,
        15
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        3
      ],
      "width_cells": 2,
      "target": "room-h-m1-1",
      "target_door": [
        0,
        17
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "依頼の書類と紙の保管・筆記と茶売りの動線、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-m1",
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "D......QQQ#",
      "D......QQQ#",
      "#.........D",
      "#RR.......D",
      "#RR....WWW#",
      "#......WWW#",
      "####DD#####"
    ]
  }
}
---
# エーリヒの家／1階 家庭と依頼の入口

## 用途と暮らし

[[building-h-m1]] の平面案に属する。家庭の帰宅と代書の依頼を受ける入口を持つ。家族は筆記机と預かり書類の脇を通らず、台所と上階へ行く案とする。

## 未解決の条件

敷地と構造・戸と窓、依頼と書類の保管・筆記と茶売りの動線、給排水と便所・火と灰・紙の湿気、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
D......QQQ#
D......QQQ#
#.........D
#RR.......D
#RR....WWW#
#......WWW#
####DD#####
```
