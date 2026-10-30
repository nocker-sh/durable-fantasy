---
{
  "id": "facility-h8-treatment",
  "kind": "facilities",
  "title": "オットーとクララの家の排泄物・汚水処理区画",
  "status": "設計中",
  "source": ".docs/settings/buildings/building-h8.md",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "owner_building": "building-h8",
  "caretakers": [
    "resident-オットー",
    "resident-クララ"
  ],
  "users": [
    "resident-オットー",
    "resident-クララ",
    "resident-ヨナス"
  ],
  "sanitation_role": "treatment",
  "site": {
    "map": "map-phanthiet",
    "status": "proposed",
    "occupied_rect_tiles": [
      8.4,
      43.8,
      11.971428571428572,
      47.37142857142857
    ]
  },
  "accepts_streams": [
    "excreta",
    "greywater"
  ],
  "material_routes": [
    {
      "stream": "treated_residue",
      "to": "facility-h8-nonfood-plot",
      "container_id": "container-h8-treated-solid",
      "status": "proposed",
      "container_symbol": "S",
      "carry_plan": {
        "carrier": "resident-オットー",
        "max_fill_l": 7
      }
    },
    {
      "stream": "treated_water",
      "to": "facility-h8-nonfood-plot",
      "container_id": "container-h8-treated-water",
      "status": "proposed",
      "container_symbol": "W",
      "carry_plan": {
        "carrier": "resident-クララ",
        "max_fill_l": 8
      }
    }
  ],
  "issues": [
    "地下水・地形・雨水と洪水・井戸との流路は未照合",
    "容器の実物と充填上限時の重さ・冬の処理条件・手入れの日課と搬送の実装は未照合",
    "槽の容量・配管と高低差・蓋・屋根と換気、入力と出力の動線の立体は未設計",
    "処理後の容器は配置済みだが、充填上限での持上げと屋外搬送は未照合"
  ],
  "design_dependencies": [
    "building-h8",
    "map-phanthiet",
    "facility-h8-nonfood-plot",
    "resident-オットー",
    "resident-クララ"
  ],
  "bed_capacity": 0,
  "occupants": [
    "オットー",
    "クララ"
  ],
  "connections": [
    {
      "kind": "door",
      "target": "map-phanthiet",
      "door": [
        4,
        0
      ],
      "width_cells": 2
    },
    {
      "kind": "door",
      "target": "map-phanthiet",
      "door": [
        4,
        9
      ],
      "width_cells": 2
    }
  ],
  "furniture": [
    {
      "symbol": "H",
      "name": "排泄物の保留と熟成の閉じた槽",
      "owner": "オットーとクララの世帯",
      "source": "ハインリヒの陶製内張りとゴットフリートの木枠・置台の案",
      "rect": [
        1,
        1,
        3,
        3
      ],
      "access": [
        [
          4,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "排泄物の保留と熟成の閉じた槽を扱う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "G",
      "name": "洗い水の受け槽と処理床",
      "owner": "オットーとクララの世帯",
      "source": "ハインリヒの陶製内張りとゴットフリートの木枠・置台の案",
      "rect": [
        6,
        1,
        3,
        3
      ],
      "access": [
        [
          5,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "洗い水の受け槽と処理床を扱う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "専用の手入れ道具の台",
      "owner": "オットーとクララの世帯",
      "source": "ハインリヒの陶製内張りとゴットフリートの木枠・置台の案",
      "rect": [
        1,
        4,
        1,
        1
      ],
      "access": [
        [
          2,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "専用の手入れ道具の台を扱う",
          "rect": [
            2,
            4,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "S",
      "name": "処理後の残さ容器の置台",
      "owner": "オットーとクララの世帯",
      "source": "ハインリヒの陶製内張りとゴットフリートの木枠・置台の案",
      "rect": [
        1,
        6,
        2,
        2
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "処理後の残さ容器の置台を扱う",
          "rect": [
            3,
            5,
            2,
            2
          ]
        }
      ],
      "transport_container": {
        "id": "container-h8-treated-solid",
        "stream": "treated_residue",
        "shape": "cylinder",
        "material": "wood",
        "lidded": true,
        "outer_diameter_m": 0.3,
        "outer_height_m": 0.32,
        "inner_diameter_m": 0.276,
        "usable_depth_m": 0.23,
        "capacity_l": 10,
        "empty_mass_kg": 2.5
      }
    },
    {
      "symbol": "W",
      "name": "処理水容器の置台",
      "owner": "オットーとクララの世帯",
      "source": "ハインリヒの陶製内張りとゴットフリートの木枠・置台の案",
      "rect": [
        7,
        6,
        2,
        2
      ],
      "access": [
        [
          6,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "処理水容器の置台を扱う",
          "rect": [
            5,
            5,
            2,
            2
          ]
        }
      ],
      "transport_container": {
        "id": "container-h8-treated-water",
        "stream": "treated_water",
        "shape": "cylinder",
        "material": "wood",
        "lidded": true,
        "outer_diameter_m": 0.3,
        "outer_height_m": 0.3,
        "inner_diameter_m": 0.276,
        "usable_depth_m": 0.22,
        "capacity_l": 10,
        "empty_mass_kg": 2.4
      }
    }
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD####",
      "#HHH..GGG#",
      "#HHH..GGG#",
      "#HHH..GGG#",
      "#T.......#",
      "#........#",
      "#SS....WW#",
      "#SS....WW#",
      "#........#",
      "####DD####"
    ]
  },
  "access_routes": [
    {
      "from": {
        "document": "building-h8",
        "room": "room-h8-1",
        "door": [
          13,
          10
        ]
      },
      "door": [
        4,
        0
      ],
      "width_m": 0.8,
      "points_tiles": [
        [
          10.8,
          38.72857142857143
        ],
        [
          11.5,
          38.72857142857143
        ],
        [
          11.5,
          42.37
        ],
        [
          10.185714285714287,
          42.37
        ],
        [
          10.185714285714287,
          43.8
        ]
      ],
      "status": "proposed"
    },
    {
      "from": {
        "document": "facility-h8-privy",
        "door": [
          1,
          0
        ]
      },
      "door": [
        4,
        0
      ],
      "width_m": 0.8,
      "points_tiles": [
        [
          6.514285714285714,
          42.8
        ],
        [
          6.514285714285714,
          42.37
        ],
        [
          10.185714285714287,
          42.37
        ],
        [
          10.185714285714287,
          43.8
        ]
      ],
      "status": "proposed"
    }
  ]
}
---
# オットーとクララの家の排泄物・汚水処理区画

## 所有と扱う物

オットーとクララが自宅分だけを手入れする屋根付きの処理区画とする。町全体の処理をこの家へ集めない。[[facility-h8-privy]]と夜間の受け容器から来る排泄物は漏れない保留槽と熟成の区画へ、台所の洗い水は別の受け槽と処理床へ入れる。容器と道具、移す経路を混ぜず、果物と飲用水の容器は持ち込まない。

## 保留と処理後の行き先

保留中の物を処理済みとして外へ出さない。冬の分解・熟成と水処理、必要な容量、判定と交換の条件はまだ設計されていないため、現時点では運用を開始したことにしない。処理条件が確定してから、残さと処理水を別の専用容器で[[facility-h8-nonfood-plot]]へ運ぶ計画とする。果樹園、畑、飼料、井戸への利用を前提にしない。

## 敷地の条件

便所の東南に区画を提案する。蓋と雨水の分離、槽の取出しと清掃、手洗いの水、道具の収納、地下水と地面の傾きは未照合である。平面の場所と参照先があることを、処理性能や衛生の確認済みという意味にしない。

## 処理後の搬出容器

残さ用 S と処理水用 W の専用容器を別々の置台へ割り当て、形と容量・空の重さ、使用面を持つ。充填上限での持上げと搬出はまだ確認していない。北の未処理物の受入と南の処理後の搬出を分け、同時には行わない。二つの槽の受入も同時には行わない。共有する中央の床と道具の手入れ、処理済みの判定と作業の切替は未設計であり、配置だけで清潔な搬送を証明しない。

## 処理区画の平面案

北側に別々の受け槽、南側に処理後の専用容器を置く。槽と配管の高さ、保留と処理の容量、清掃と冬の条件は別に設計する。外形は一セル半メートルのグリッドの実寸で敷地へ換算する。

```grid
####DD####
#HHH..GGG#
#HHH..GGG#
#HHH..GGG#
#T.......#
#........#
#SS....WW#
#SS....WW#
#........#
####DD####
```

## 運搬時の充填上限

carry_plan で担当者と運搬時の充填上限を指定する。容器の容量と運搬に使う量を分け、上限の線に達したら蓋を閉じて一容器ずつ扱う。中身の質量は設計用の密度上限の仮定で計算し、空容器を加える。容器が容量まで入ることだけで運べるとはせず、担当者の仮の上限と照合する。実能力、把手や蓋、運ぶ頻度と経路はまだ確認していない。


## 未処理物の屋外受入経路

家と [[facility-h8-privy]] のそれぞれから北戸口へ入る平面経路案を持つ。家の南側の通路を共有し、容器は蓋を閉じて一つずつ運ぶ。便所からは北戸口を出て東へ回る。処理後の南側搬出とは受渡し時刻を分ける。段差、戸の操作、把手と持ち姿勢、北戸口から各槽の使用面までの搬送はまだ照合していない。
