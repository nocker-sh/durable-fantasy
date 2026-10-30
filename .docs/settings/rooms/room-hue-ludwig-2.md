---
{
  "id": "room-hue-ludwig-2",
  "kind": "rooms",
  "title": "ルードヴィヒの寝間の案",
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
  "grid": {
    "cell_m": 0.5,
    "rows": [
      "#######",
      "#BB...#",
      "#BB...#",
      "#BB...#",
      "#BB...#",
      "#CC...#",
      "###DD##"
    ]
  },
  "furniture": [
    {
      "symbol": "B",
      "name": "本人の寝台",
      "role": "bed",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        1,
        1,
        2,
        4
      ],
      "access": [
        [
          3,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "起きる・寝具を整える",
          "rect": [
            3,
            1,
            2,
            4
          ]
        }
      ]
    },
    {
      "symbol": "C",
      "name": "本人専用の衣服と首巻き・私物の収納",
      "role": "storage",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        1,
        5,
        2,
        1
      ],
      "access": [
        [
          3,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "着替えと個人収納を使う",
          "rect": [
            3,
            4,
            2,
            2
          ]
        }
      ],
      "compartments": [
        "本人専用"
      ]
    }
  ],
  "guest_capacity": 0,
  "issues": [
    "平面の占有と使用面の案。家具の立体・身体と戸の開閉、物の容量と供給は未照合",
    "熱と灯り・換気、灰と汚水・排泄物と日課、実際の敷地と構造は未設計",
    "扉の板と金具の平面回転の案。枠と金具の実物・上下の隙間、操作する身体と開位置での通行は未照合"
  ],
  "design_dependencies": [
    "town-hue",
    "map-hue-quarter",
    "building-hue-ludwig",
    "resident-ルードヴィヒ",
    "room-hue-ludwig-hall"
  ],
  "bed_capacity": 1,
  "private_for": [
    "resident-ルードヴィヒ"
  ],
  "sleeping_places": [
    {
      "id": "bed-hue-ludwig-1",
      "resident": "resident-ルードヴィヒ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_id": "storage-hue-ludwig-1"
    }
  ],
  "personal_storage": [
    {
      "id": "storage-hue-ludwig-1",
      "resident": "resident-ルードヴィヒ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人専用"
    }
  ],
  "origin": [
    0,
    0
  ],
  "connections": [
    {
      "kind": "door",
      "target": "room-hue-ludwig-hall",
      "door": [
        3,
        6
      ],
      "width_cells": 2,
      "target_door": [
        3,
        0
      ]
    }
  ],
  "door_leaves": [
    {
      "door": [
        3,
        6
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
          "furniture": "C",
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
      1.5
    ],
    "entries": [
      {
        "door": [
          3,
          6
        ],
        "points_m": [
          [
            2,
            3
          ],
          [
            2,
            1.5
          ]
        ]
      }
    ]
  }
}
---
# ルードヴィヒの寝間の案

## 本人の寝床と個人収納

[[resident-ルードヴィヒ]] 本人の常用の寝床を固有の寝台へ割り当てる。来訪者の寝床や工房の休憩用の席とは共有しない。衣服・首巻き・私物も本人専用の収納 ID へ結び、寝台側と住民側で同じ割当を参照する。

## 家具と使用面の案

寝台 B と個人収納 C を平面へ割り当て、同じ本人の寝台・収納 ID を保持する。寝台の占有と側面の使用面、個人収納の使用面は平面の案であり、本人の体と寝具、起きる・着替える・寝具を整える身体、収納の開閉と取り出し、灯りと換気・寒さと灰の対策は未照合である。固有 ID の割当を、家具の収まりや生活の成立へ広げない。

## 平面と出入口の案

[[building-hue-ludwig]] の共通座標へ結び、入口と家具・使用面を先に確かめる。平面の到達性と幅の照合を、家具の立体や身体・扉の開閉と一日の成立の代わりにしない。

```grid
#######
#BB...#
#BB...#
#BB...#
#BB...#
#CC...#
###DD##
```


## 扉と作業の順序の案

戸は寝間へ開く。寝台 B と個人収納 C に当たる端を蝶番にせず、反対の端へ置く。寝具を整える作業と個人収納を扱う作業は、扉を動かす前に終える。家具の占有は変えず、寝台と収納の使用面を扉の回転と同時に使わない。 扉を持つ室の対応と、実際の身体・立体と日課の残件は [[building-hue-ludwig#戸口と扉を持つ室]] に従う。


## 開位置の通過点へ進む案

寝間の戸口から寝台側の通路の通過点へ進む。 板と枠を残す平面通行の範囲、本人の身体と開閉の操作・使用面の残件は [[building-hue-ludwig#開いた扉を避ける通行の案]] に従う。
