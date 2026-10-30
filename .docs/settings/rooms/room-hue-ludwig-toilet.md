---
{
  "id": "room-hue-ludwig-toilet",
  "kind": "rooms",
  "title": "ルードヴィヒの便所と手洗いの案",
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
    "room-hue-ludwig-hall"
  ],
  "origin": [
    6,
    10
  ],
  "grid": {
    "cell_m": 0.5,
    "rows": [
      "###DD##",
      "#H....#",
      "#.....#",
      "#...PP#",
      "#X..PP#",
      "#X....#",
      "#######"
    ]
  },
  "furniture": [
    {
      "symbol": "P",
      "name": "本人の便所の候補",
      "role": "toilet",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        4,
        3,
        2,
        2
      ],
      "access": [
        [
          3,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "便所を使い手入れする",
          "rect": [
            2,
            2,
            2,
            3
          ]
        }
      ]
    },
    {
      "symbol": "H",
      "name": "便所専用の手洗い鉢",
      "role": "toilet_handwash",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        1,
        1,
        1,
        1
      ],
      "access": [
        [
          2,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "便所を使った後に手を洗う",
          "rect": [
            2,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "X",
      "name": "排泄物を一時保管する蓋付き容器の場所",
      "role": "toilet_waste_holding",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        1,
        4,
        1,
        2
      ],
      "access": [
        [
          2,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "専用の容器を交換し閉じる",
          "rect": [
            2,
            3,
            2,
            3
          ]
        }
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "target": "room-hue-ludwig-hall",
      "door": [
        3,
        0
      ],
      "width_cells": 2,
      "target_door": [
        9,
        4
      ]
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
        3,
        0
      ],
      "hinge": "end",
      "frame_inset_m": 0.025,
      "thickness_m": 0.04,
      "fittings": {
        "handle_along_m": 0.8,
        "brace_projection_m": 0.015,
        "handle_projection_m": 0.025
      },
      "waits_for": [
        {
          "furniture": "P",
          "space_index": 0
        },
        {
          "furniture": "H",
          "space_index": 0
        }
      ]
    }
  ],
  "open_door_passages": {
    "scope": "fully_open_planar_passages",
    "status": "proposed",
    "body_radius_m": 0.4,
    "hub_m": [
      1.5,
      2.5
    ],
    "entries": [
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
          ],
          [
            1.5,
            1
          ],
          [
            1.5,
            2.5
          ]
        ]
      }
    ]
  }
}
---
# ルードヴィヒの便所と手洗いの案

## 用途と運ぶ物

便所 P と専用の手洗い H、汚れた物の閉じた一時保管 X を台所から分ける。鉢や容器の記号があるだけで、水や容量・清掃と交換が成立した扱いにしない。地面や溝へ直接流さず、最終処理先・搬出と水の受取、換気と手の動作を続けて設計する。

## 平面と出入口の案

[[building-hue-ludwig]] の共通座標へ結び、入口と家具・使用面を先に確かめる。平面の到達性と幅の照合を、家具の立体や身体・扉の開閉と一日の成立の代わりにしない。

```grid
###DD##
#H....#
#.....#
#...PP#
#X..PP#
#X....#
#######
```


## 扉と作業の順序の案

戸は便所の室へ開き、廊下を通る人へ板を出さない。便所 P と専用の手洗い H の使用面が回転域を共有するため、作業を終えてから戸を動かす。手洗いと戸の取っ手の扱い・清掃を含む衛生の工程はまだ成立していない。 扉を持つ室の対応と、実際の身体・立体と日課の残件は [[building-hue-ludwig#戸口と扉を持つ室]] に従う。


## 開位置の通過点へ進む案

戸口から専用の手洗いと便所・保管の間の通路へ進む。 板と枠を残す平面通行の範囲、本人の身体と開閉の操作・使用面の残件は [[building-hue-ludwig#開いた扉を避ける通行の案]] に従う。
