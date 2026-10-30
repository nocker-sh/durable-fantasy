---
{
  "id": "room-hue-ludwig-fuel",
  "kind": "rooms",
  "title": "ルードヴィヒの燃料と冷えた灰の案",
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
    12,
    10
  ],
  "grid": {
    "cell_m": 0.5,
    "rows": [
      "###DD###",
      "#BB...T#",
      "#BB...T#",
      "#AA....D",
      "#AA....D",
      "#......#",
      "########"
    ]
  },
  "furniture": [
    {
      "symbol": "B",
      "name": "乾いた薪と炭の保管箱",
      "role": "dry_household_fuel",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        1,
        1,
        2,
        2
      ],
      "access": [
        [
          3,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "燃料を家へ入れ小分けする",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "A",
      "name": "冷えた炉灰を留める閉じた容器の場所",
      "role": "cooled_ash_holding",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        1,
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
          "activity": "冷えた灰の容器を閉じて搬出する",
          "rect": [
            3,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "灰の手入れ専用の道具の場所",
      "role": "ash_tools",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        6,
        1,
        1,
        2
      ],
      "access": [
        [
          6,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "灰の専用の道具を取り出す",
          "rect": [
            5,
            3,
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
      "target": "room-hue-ludwig-hall",
      "door": [
        3,
        0
      ],
      "width_cells": 2,
      "target_door": [
        15,
        4
      ]
    },
    {
      "kind": "door",
      "target": "map-hue-quarter",
      "door": [
        7,
        3
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
          "furniture": "B",
          "space_index": 0
        },
        {
          "furniture": "A",
          "space_index": 0
        }
      ]
    },
    {
      "door": [
        7,
        3
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
          "furniture": "T",
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
      2,
      2
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
            2
          ]
        ]
      },
      {
        "door": [
          7,
          3
        ],
        "points_m": [
          [
            3.5,
            2
          ],
          [
            2,
            2
          ]
        ]
      }
    ]
  }
}
---
# ルードヴィヒの燃料と冷えた灰の案

## 用途と運ぶ物

B は乾いた薪と炭、A は冷えた灰の閉じた容器、T は灰を扱う専用の道具の候補である。燃えている物をこの保管へ戻さず、実際の不燃材料・温度と火の残りの確認は未設計である。外側の戸からの荷の搬入出と最終処理先、保持する量と容器の荷重・清掃は続けて設計する。

## 平面と出入口の案

[[building-hue-ludwig]] の共通座標へ結び、入口と家具・使用面を先に確かめる。平面の到達性と幅の照合を、家具の立体や身体・扉の開閉と一日の成立の代わりにしない。

```grid
###DD###
#BB...T#
#BB...T#
#AA....D
#AA....D
#......#
########
```


## 扉と作業の順序の案

廊下側と外の搬入出の戸は、どちらもこの室へ開く。道具 T と冷えた灰の容器 A は大きさを保って移し、燃料の箱 B も含めて板と金具の回転を避ける。廊下側は B と A、外の戸は T の使用を終えてから動かす。使用面が重なることを、家具への衝突を免除する理由にしない。 扉を持つ室の対応と、実際の身体・立体と日課の残件は [[building-hue-ludwig#戸口と扉を持つ室]] に従う。


## 開位置の通過点へ進む案

廊下側と搬入出の外の戸を室内の共通の通過点へつなぐ。 板と枠を残す平面通行の範囲、本人の身体と開閉の操作・使用面の残件は [[building-hue-ludwig#開いた扉を避ける通行の案]] に従う。
