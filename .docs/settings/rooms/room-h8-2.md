---
{
  "id": "room-h8-2",
  "kind": "rooms",
  "title": "オットーとクララの家／1階 台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h8",
  "floor": 0,
  "room_name": "台所",
  "use": "台所",
  "occupants": [
    "オットー",
    "クララ",
    "ヨナス"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####DD#######",
      "#FF....WKK.OO#",
      "#FF........OO#",
      "#............#",
      "#R.........Q.#",
      "#............#",
      "##############"
    ],
    "legend": {
      "#": "壁",
      ".": "床と使用面",
      "D": "出入口"
    }
  },
  "connections": [
    {
      "kind": "door",
      "target": "room-h8-1",
      "door": [
        5,
        0
      ],
      "width_cells": 2,
      "target_door": [
        5,
        13
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "F",
      "name": "穀物と器の棚",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
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
          "activity": "穀物と器の棚を使う",
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
      "symbol": "K",
      "name": "家庭の調理台",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        8,
        1,
        2,
        1
      ],
      "access": [
        [
          8,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の調理台を使う",
          "rect": [
            7,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "O",
      "name": "家庭の調理炉",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        11,
        1,
        2,
        2
      ],
      "access": [
        [
          10,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の調理炉を使う",
          "rect": [
            9,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "蓋付き飲用水甕",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        7,
        1,
        1,
        1
      ],
      "access": [
        [
          6,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "蓋付き飲用水甕を使う",
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
      "name": "家庭の洗い物の桶",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
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
          "activity": "家庭の洗い物の桶を使う",
          "rect": [
            2,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "Q",
      "name": "蓋付き洗い水受け",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        11,
        4,
        1,
        1
      ],
      "access": [
        [
          10,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "蓋付き洗い水受けを使う",
          "rect": [
            9,
            3,
            2,
            2
          ]
        }
      ],
      "transport_container": {
        "shape": "cylinder",
        "id": "container-h8-kitchen-greywater",
        "stream": "greywater",
        "material": "wood",
        "lidded": true,
        "outer_diameter_m": 0.3,
        "outer_height_m": 0.28,
        "inner_diameter_m": 0.276,
        "usable_depth_m": 0.2,
        "capacity_l": 8,
        "empty_mass_kg": 2.3
      }
    }
  ],
  "issues": [
    "戸と枠・操作する身体・窓と換気の立体照合は未完了",
    "便所・灰・汚水の搬出先、容器容量と日課・描画の照合は未完了"
  ],
  "design_dependencies": [
    "building-h8",
    "facility-h8-privy",
    "facility-h8-treatment",
    "facility-h8-nonfood-plot",
    "resident-クララ"
  ],
  "origin": [
    0,
    13
  ],
  "material_routes": [
    {
      "stream": "greywater",
      "to": "facility-h8-treatment",
      "container_id": "container-h8-kitchen-greywater",
      "status": "proposed",
      "container_symbol": "Q",
      "carry_plan": {
        "carrier": "resident-クララ",
        "max_fill_l": 8
      }
    }
  ]
}
---
# オットーとクララの家／1階 台所

## 家庭の調理と配膳

果物を扱う仕事と家で食事を作る場所を分ける。売り物の選別や洗濯の石鹸水を調理台へ持ち込まない。飲用水を蓋付き甕へ受け、穀物と器は乾いた棚へ収める。炉から居間の食卓へ配膳し、寝室を食事や薪の運搬路にしない。

洗い物の桶と汚れた水の受けを分け、井戸へ戻したり川へ直流ししたりしない。井戸から運ぶ容器、炉の薪と灰、便所と汚水の搬出先は家庭の処理区画の案へつなぐ。処理容量と搬送、換気と煙突の照合は残る。

## 平面

一セルは半メートル。隣室と共有する壁と戸口は建物の原点で合わせる。

```grid
#####DD#######
#FF....WKK.OO#
#FF........OO#
#............#
#R.........Q.#
#............#
##############
```

## 洗い水の搬出案

洗い水の受け Q は専用の蓋付き容器として[[facility-h8-treatment]]の汚水側へ運ぶ案を持つ。飲用水甕や排泄物の容器と兼用せず、処理前の水を植栽へ直接流さない。量と容器の重さ、戸や階段を通る姿勢は未設計である。

## 容器と置き場所

搬送に使う容器のIDを家具の transport_container へ結び付ける。円筒の外径・高さと内径・使う深さ、容量、空の重さを設計値として持ち、台の占有内に収まることと内側の容積を超えないことを照合する。蓋の固定、持ち上げる姿勢、充填上限時の重さと通路・階段の搬送はまだ確認していない。

## 運搬時の充填上限

carry_plan で担当者と運搬時の充填上限を指定する。容器の容量と運搬に使う量を分け、上限の線に達したら蓋を閉じて一容器ずつ扱う。中身の質量は設計用の密度上限の仮定で計算し、空容器を加える。容器が容量まで入ることだけで運べるとはせず、担当者の仮の上限と照合する。実能力、把手や蓋、運ぶ頻度と経路はまだ確認していない。
