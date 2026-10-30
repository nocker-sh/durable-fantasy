---
{
  "id": "facility-h8-privy",
  "kind": "facilities",
  "title": "オットーとクララの家の便所",
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
  "sanitation_role": "privy",
  "site": {
    "map": "map-phanthiet",
    "status": "proposed",
    "occupied_rect_tiles": [
      5.8,
      42.8,
      7.585714285714285,
      45.3
    ]
  },
  "accepts_streams": [],
  "material_routes": [
    {
      "stream": "excreta",
      "to": "facility-h8-treatment",
      "container_id": "container-h8-privy",
      "status": "proposed",
      "container_symbol": "B",
      "carry_plan": {
        "carrier": "resident-オットー",
        "max_fill_l": 5
      }
    }
  ],
  "issues": [
    "地下水・地形・雨水と洪水・井戸との流路は未照合",
    "容器の容量と重さ・冬の処理条件・手入れの日課と搬送の実装は未完了",
    "家からの屋外経路は平面案。段差・灯り・戸の操作と頭上高、荷を持つ姿勢は未照合"
  ],
  "design_dependencies": [
    "building-h8",
    "map-phanthiet",
    "facility-h8-treatment",
    "resident-オットー"
  ],
  "bed_capacity": 0,
  "occupants": [
    "オットー",
    "クララ",
    "ヨナス"
  ],
  "grid": {
    "cell_m": 0.5,
    "rows": [
      "#DD##",
      "#...#",
      "#..W#",
      "#...#",
      "#...#",
      "#BB.#",
      "#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "target": "map-phanthiet",
      "door": [
        1,
        0
      ],
      "width_cells": 2
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "専用の受け容器を納める腰掛け台",
      "owner": "オットーとクララの世帯",
      "source": "ゴットフリートの木台とハインリヒの陶製受け容器",
      "rect": [
        1,
        5,
        2,
        1
      ],
      "access": [
        [
          1,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "腰掛けを使う",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ],
      "transport_container": {
        "shape": "cylinder",
        "id": "container-h8-privy",
        "stream": "excreta",
        "material": "glazed_ceramic",
        "lidded": true,
        "outer_diameter_m": 0.3,
        "outer_height_m": 0.3,
        "inner_diameter_m": 0.288,
        "usable_depth_m": 0.23,
        "capacity_l": 10,
        "empty_mass_kg": 4.8
      }
    },
    {
      "symbol": "W",
      "name": "手洗いの盆と清潔な水の台",
      "owner": "オットーとクララの世帯",
      "source": "ハインリヒの盆とゴットフリートの台",
      "rect": [
        3,
        2,
        1,
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
          "activity": "手を洗う",
          "rect": [
            1,
            1,
            2,
            2
          ]
        }
      ]
    }
  ],
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
        1,
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
          6.514285714285714,
          42.37
        ],
        [
          6.514285714285714,
          42.8
        ]
      ],
      "status": "proposed"
    }
  ]
}
---
# オットーとクララの家の便所

## 使う家族と持ち主

[[building-h8]]の三人だけが使う屋外の便所とする。手入れと受け容器の交換はオットーとクララが担い、ヨナスへ汚れた容器の搬出を任せない。夜と寒い時間は各寝室の蓋付き夜間容器を使い、家族が誰かの寝室を通ってここへ出る必要を作らない。

## 身体と容器の場所

北の戸から入り、奥の腰掛けを使う。受け容器はハインリヒの陶器を専用品として持ち、ゴットフリートの腰掛け台の下へ納める。飲用水、果物、洗濯に使う器へ戻さない。手洗いの盆と清潔な水の容器は別の台に置く。洗い水と受け容器の交換は入口と区別した手入れ側から扱う計画であり、背面の取出し口と作業する身体の立体は未設計である。

## 家からの経路と搬出

家の東の戸から外へ出て東側を南へ回り、家の南と便所の北の間を通る案とする。戸口から幅を持つ屋外経路を access_routes に記録し、家・設備と川の占有を平面で照合する。地面の高さと段差、夜の灯り、雨と灰を避ける足元、戸の操作と頭上高は未確定である。蓋を閉じた受け容器は[[facility-h8-treatment]]の排泄物専用区画へ運び、井戸や果樹園へ直接運ばない。覆いに使う乾いた木屑は木工所から家庭分だけ受け、火のついた灰は使わない。

## 平面案

一セルは半メートル。屋根と背面の手入れ床、戸の操作は別に設計する。

```grid
#DD##
#...#
#..W#
#...#
#...#
#BB.#
#####
```

## 容器と置き場所

搬送に使う容器のIDを家具の transport_container へ結び付ける。円筒の外径・高さと内径・使う深さ、容量、空の重さを設計値として持ち、台の占有内に収まることと内側の容積を超えないことを照合する。蓋の固定、持ち上げる姿勢、充填上限時の重さと通路・階段の搬送はまだ確認していない。

## 運搬時の充填上限

carry_plan で担当者と運搬時の充填上限を指定する。容器の容量と運搬に使う量を分け、上限の線に達したら蓋を閉じて一容器ずつ扱う。中身の質量は設計用の密度上限の仮定で計算し、空容器を加える。容器が容量まで入ることだけで運べるとはせず、担当者の仮の上限と照合する。実能力、把手や蓋、運ぶ頻度と経路はまだ確認していない。
