---
{
  "id": "room-hue-ludwig-hall",
  "kind": "rooms",
  "title": "ルードヴィヒの家の入口と廊下の案",
  "status": "設計中",
  "source": ".docs/settings/towns/town-hue.md",
  "design_gate": "未通過",
  "town": "town-hue",
  "implementation": "未実装の設計案",
  "building": "building-hue-ludwig",
  "map": "map-hue-quarter",
  "household": "hue-ludwig",
  "floor": 0,
  "occupants": [
    "ルードヴィヒ"
  ],
  "bed_capacity": 0,
  "guest_capacity": 0,
  "sleeping_places": [],
  "personal_storage": [],
  "design_dependencies": [
    "town-hue",
    "map-hue-quarter",
    "building-hue-ludwig",
    "resident-ルードヴィヒ",
    "room-hue-ludwig-2",
    "room-hue-ludwig-1",
    "room-hue-ludwig-wash",
    "room-hue-ludwig-toilet",
    "room-hue-ludwig-fuel"
  ],
  "origin": [
    0,
    6
  ],
  "grid": {
    "cell_m": 0.5,
    "rows": [
      "###DD####DD#########",
      "D..................#",
      "D..................#",
      "#..................#",
      "###DD####DD####DD###"
    ]
  },
  "furniture": [],
  "connections": [
    {
      "kind": "door",
      "target": "room-hue-ludwig-2",
      "door": [
        3,
        0
      ],
      "width_cells": 2,
      "target_door": [
        3,
        6
      ]
    },
    {
      "kind": "door",
      "target": "room-hue-ludwig-1",
      "door": [
        9,
        0
      ],
      "width_cells": 2,
      "target_door": [
        3,
        6
      ]
    },
    {
      "kind": "door",
      "target": "room-hue-ludwig-wash",
      "door": [
        3,
        4
      ],
      "width_cells": 2,
      "target_door": [
        3,
        0
      ]
    },
    {
      "kind": "door",
      "target": "room-hue-ludwig-toilet",
      "door": [
        9,
        4
      ],
      "width_cells": 2,
      "target_door": [
        3,
        0
      ]
    },
    {
      "kind": "door",
      "target": "room-hue-ludwig-fuel",
      "door": [
        15,
        4
      ],
      "width_cells": 2,
      "target_door": [
        3,
        0
      ]
    },
    {
      "kind": "door",
      "target": "map-hue-quarter",
      "door": [
        0,
        1
      ],
      "width_cells": 2
    }
  ],
  "issues": [
    "平面の占有と使用面の案。家具の立体・身体と戸の開閉、物の容量と供給は未照合",
    "熱と灯り・換気、灰と汚水・排泄物と日課、実際の敷地と構造は未設計",
    "扉の板と金具の平面回転の案。枠と金具の実物・上下の隙間、操作する身体と開位置での通行は未照合"
  ],
  "door_leaves": [
    {
      "door": [
        0,
        1
      ],
      "hinge": "end",
      "frame_inset_m": 0.025,
      "thickness_m": 0.04,
      "fittings": {
        "handle_along_m": 0.8,
        "brace_projection_m": 0.015,
        "handle_projection_m": 0.025
      },
      "waits_for": []
    }
  ],
  "open_door_passages": {
    "scope": "fully_open_planar_passages",
    "status": "proposed",
    "body_radius_m": 0.4,
    "hub_m": [
      2,
      1
    ],
    "entries": [
      {
        "door": [
          0,
          1
        ],
        "points_m": [
          [
            0.5,
            1
          ],
          [
            2,
            1
          ]
        ]
      },
      {
        "door": [
          3,
          0
        ],
        "points_m": [
          [
            2,
            0.5
          ],
          [
            2,
            1
          ]
        ]
      },
      {
        "door": [
          9,
          0
        ],
        "points_m": [
          [
            5,
            0.5
          ],
          [
            5,
            1
          ],
          [
            2,
            1
          ]
        ]
      },
      {
        "door": [
          3,
          4
        ],
        "points_m": [
          [
            2,
            2
          ],
          [
            2,
            1
          ]
        ]
      },
      {
        "door": [
          9,
          4
        ],
        "points_m": [
          [
            5,
            2
          ],
          [
            5,
            1
          ],
          [
            2,
            1
          ]
        ]
      },
      {
        "door": [
          15,
          4
        ],
        "points_m": [
          [
            8,
            2
          ],
          [
            8,
            1
          ],
          [
            2,
            1
          ]
        ]
      }
    ]
  }
}
---
# ルードヴィヒの家の入口と廊下の案

## 用途と運ぶ物

入口から各室へ向かう廊下は家具を置かず、扉の手前を荷物の保管へ使わない。便所と衣服の手入れのために食卓や本人の寝床を通らない。薪と灰の室の外側の戸を、生活用の入口と別の搬入出の候補とする。

## 平面と出入口の案

[[building-hue-ludwig]] の共通座標へ結び、入口と家具・使用面を先に確かめる。平面の到達性と幅の照合を、家具の立体や身体・扉の開閉と一日の成立の代わりにしない。

```grid
###DD####DD#########
D..................#
D..................#
#..................#
###DD####DD####DD###
```


## 扉と作業の順序の案

外の入口の戸は廊下へ開く。内壁へ板と金具が当たる端を蝶番にせず、反対の端へ置く。各室との共有する戸口の板は相手の室へ持たせ、廊下へ二枚目の板を追加しない。戸の回転と通行の余地へ荷物を置かない。 扉を持つ室の対応と、実際の身体・立体と日課の残件は [[building-hue-ludwig#戸口と扉を持つ室]] に従う。


## 開位置の通過点へ進む案

外の入口と各室の戸口を廊下の共通の通過点へつなぐ。 板と枠を残す平面通行の範囲、本人の身体と開閉の操作・使用面の残件は [[building-hue-ludwig#開いた扉を避ける通行の案]] に従う。
