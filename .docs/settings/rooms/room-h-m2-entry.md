---
{
  "id": "room-h-m2-entry",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-m2",
  "bed_capacity": 0,
  "title": "アガーテのろうそく屋／1階 家庭の入口と身支度",
  "room_name": "1階 家庭の入口と身支度",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    14
  ],
  "use": "生活",
  "occupants": [
    "アガーテ",
    "ジーモン",
    "フェリックス"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "仕事靴の受け",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
      ],
      "rect": [
        1,
        6,
        2,
        3
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "仕事靴の受けを使う",
          "rect": [
            3,
            6,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "帰宅時の手洗い台",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
      ],
      "rect": [
        7,
        1,
        3,
        2
      ],
      "access": [
        [
          7,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "帰宅時の手洗い台を使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "Q",
      "name": "外套と前掛けの受け",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
      ],
      "rect": [
        7,
        8,
        3,
        2
      ],
      "access": [
        [
          6,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "外套と前掛けの受けを使う",
          "rect": [
            5,
            8,
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
        11
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
      "target": "room-h-m2-1",
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
      "target": "room-h-m2-lower-stairs",
      "target_door": [
        5,
        15
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        6
      ],
      "width_cells": 2,
      "target": "room-h-m2-oil-store",
      "target_door": [
        0,
        6
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "蝋と灯り油の工程・火と温度・換気、家庭の給排水と便所・日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-m2",
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "private_for": [
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "D......WWW#",
      "D......WWW#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#RR.......D",
      "#RR.......D",
      "#RR....QQQ#",
      "#......QQQ#",
      "#.........#",
      "####DD#####"
    ]
  }
}
---
# アガーテのろうそく屋／1階 家庭の入口と身支度

## 用途と暮らし

[[building-h-m2]] の平面案に属する。家族の屋外の入口と身支度・階段を結ぶ。子どもが熱い蝋の部屋を通らず、自分の寝床と家庭の食卓へ行く案とする。

## 未解決の条件

敷地と構造・戸と窓、火と温度・油と蝋の保管と運搬、灰と換気・廃物、給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
D......WWW#
D......WWW#
#.........#
#.........#
#.........#
#RR.......D
#RR.......D
#RR....QQQ#
#......QQQ#
#.........#
####DD#####
```
