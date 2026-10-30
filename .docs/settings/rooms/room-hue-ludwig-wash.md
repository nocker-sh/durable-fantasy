---
{
  "id": "room-hue-ludwig-wash",
  "kind": "rooms",
  "title": "ルードヴィヒの衣服の手入れと室内干しの案",
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
    0,
    10
  ],
  "grid": {
    "cell_m": 0.5,
    "rows": [
      "###DD##",
      "#CC...#",
      "#.....#",
      "#.....#",
      "#W..RR#",
      "#W..RR#",
      "#######"
    ]
  },
  "furniture": [
    {
      "symbol": "W",
      "name": "衣服を洗う槽の候補",
      "role": "clothes_washing",
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
          "activity": "衣服と寝具の布を洗う",
          "rect": [
            2,
            3,
            2,
            3
          ]
        }
      ]
    },
    {
      "symbol": "R",
      "name": "屋根内の乾燥棚の候補",
      "role": "indoor_clothes_drying",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        4,
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
          "activity": "濡れた布を干し取り込む",
          "rect": [
            2,
            3,
            2,
            3
          ]
        }
      ]
    },
    {
      "symbol": "C",
      "name": "清潔な布と道具の収納",
      "role": "storage",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        1,
        1,
        2,
        1
      ],
      "access": [
        [
          2,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "清潔な布と専用の道具を取り出す",
          "rect": [
            1,
            2,
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
        3,
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
      "waits_for": []
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
            1.5
          ],
          [
            1.5,
            1.5
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
# ルードヴィヒの衣服の手入れと室内干しの案

## 用途と運ぶ物

W は家庭の衣服と寝具の布を洗うための槽、R は灰を避けて屋根内で干す場所、C は清潔な布と道具の収納の候補である。原毛の処理と便所の汚れた容器を兼用しない。水の受取と槽の容量、濡れた布の量と荷重、灰を避ける換気と乾燥時間・汚水の搬出は未設計である。

## 平面と出入口の案

[[building-hue-ludwig]] の共通座標へ結び、入口と家具・使用面を先に確かめる。平面の到達性と幅の照合を、家具の立体や身体・扉の開閉と一日の成立の代わりにしない。

```grid
###DD##
#CC...#
#.....#
#.....#
#W..RR#
#W..RR#
#######
```


## 扉と作業の順序の案

戸は衣服の手入れの室へ開く。清潔な布の収納 C に当たる端を避けて蝶番を置き、同じ収納と使用面を保持する。洗う槽や乾燥棚を小さくして扉を収める案にはしない。 扉を持つ室の対応と、実際の身体・立体と日課の残件は [[building-hue-ludwig#戸口と扉を持つ室]] に従う。


## 開位置の通過点へ進む案

戸口から槽と乾燥棚の間の通路へ進む。 板と枠を残す平面通行の範囲、本人の身体と開閉の操作・使用面の残件は [[building-hue-ludwig#開いた扉を避ける通行の案]] に従う。
