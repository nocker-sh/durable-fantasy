---
{
  "id": "room-h-c2-entry",
  "kind": "rooms",
  "title": "共同の作業場／1階 受渡しと共用入口",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c2",
  "floor": 0,
  "origin": [
    5,
    13
  ],
  "room_name": "1階 受渡しと共用入口",
  "use": "共用",
  "occupants": [
    "ゴットフリート",
    "マグダレーナ",
    "イルムガルト"
  ],
  "bed_capacity": 0,
  "guest_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#.........#",
      "#AAA......#",
      "#AAA......#",
      "#.........#",
      "#.........D",
      "#.........D",
      "D.........#",
      "D......BBB#",
      "#......BBB#",
      "#.........#",
      "#.........#",
      "####DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c2-1",
      "target_door": [
        4,
        13
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        5
      ],
      "width_cells": 2,
      "target": "room-h-c2-mixing",
      "target_door": [
        0,
        5
      ]
    },
    {
      "kind": "door",
      "door": [
        4,
        12
      ],
      "width_cells": 2,
      "target": "map-phanthiet-craft"
    },
    {
      "kind": "door",
      "door": [
        0,
        7
      ],
      "width_cells": 2,
      "target": "room-h-c2-lower-stairs",
      "target_door": [
        5,
        20
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "借りた道具と使用料の記録台",
      "owner": "町の共同作業場",
      "source": "町の職人へ製作と部材の調達を頼む案",
      "maintainers": [
        "resident-ゴットフリート"
      ],
      "rect": [
        1,
        2,
        3,
        2
      ],
      "access": [
        [
          1,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "借りた道具と使用料の記録台を使う",
          "rect": [
            1,
            4,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "B",
      "name": "出来上がった品の一時受け",
      "owner": "町の共同作業場",
      "source": "町の職人へ製作と部材の調達を頼む案",
      "maintainers": [
        "resident-ゴットフリート"
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
          "activity": "出来上がった品の一時受けを使う",
          "rect": [
            5,
            8,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    }
  ],
  "issues": [
    "敷地と道・地形・構造と戸・窓は未照合",
    "共用設備の管理と利用の交代・手入れ、給排水と便所・火と煙・材料と廃物、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c2",
    "resident-ゴットフリート",
    "resident-マグダレーナ",
    "resident-イルムガルト"
  ]
}
---
# 共同の作業場／1階 受渡しと共用入口

## 借りる物と返す物

[[building-h-c2]] の共用入口である。作業室の利用と借りた道具、使用料の受渡しを記録し、完成した品を一時的に受ける。利用料の規則は `world/core/crafting-rules.ts` を正とし、ここに別の料金を作らない。記録台の手入れを [[resident-ゴットフリート]] が担う案とする。

## 共用の通路

木工室と調合室、物置への階段を結ぶ。受渡しの荷を床へ置いて戸口を塞がず、作業中の人と返却に来た人が待つ位置を別に照合する。利用の順番・記録の保管・誰が料金を受け取るか、夜の灯りと開閉は未確定である。

現行の敷地と外形への収容、構造と給排水・便所、日課と立体の照合を終えるまで描画へ採用しない。

```grid
####DD#####
#.........#
#AAA......#
#AAA......#
#.........#
#.........D
#.........D
D.........#
D......BBB#
#......BBB#
#.........#
#.........#
####DD#####
```
