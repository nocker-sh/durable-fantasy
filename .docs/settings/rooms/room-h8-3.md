---
{
  "id": "room-h8-3",
  "kind": "rooms",
  "title": "オットーとクララの家／2階 寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h8",
  "floor": 1,
  "room_name": "寝室",
  "use": "寝",
  "occupants": [
    "オットー",
    "クララ"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#########",
      "#CC...FF#",
      "#AA...BB#",
      "#AA...BB#",
      "#AA...BB#",
      "#AA...BB#",
      "#.......#",
      "D.......#",
      "D.....N.#",
      "#.......#",
      "#########"
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
      "target": "room-h8-stairs",
      "door": [
        0,
        7
      ],
      "width_cells": 2,
      "target_door": [
        5,
        7
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "オットーの寝台",
      "owner": "オットー",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        1,
        2,
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
          "activity": "オットーの寝台を使う",
          "rect": [
            3,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "B",
      "name": "クララの寝台",
      "owner": "クララ",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        6,
        2,
        2,
        4
      ],
      "access": [
        [
          5,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "クララの寝台を使う",
          "rect": [
            4,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "C",
      "name": "オットーの衣服箱",
      "owner": "オットー",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        1,
        1,
        2,
        1
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "オットーの衣服箱を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "オットー"
      ],
      "compartments": [
        "本人専用の箱"
      ]
    },
    {
      "symbol": "F",
      "name": "クララの衣服箱",
      "owner": "クララ",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        6,
        1,
        2,
        1
      ],
      "access": [
        [
          5,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "クララの衣服箱を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "クララ"
      ],
      "compartments": [
        "本人専用の箱"
      ]
    },
    {
      "symbol": "N",
      "name": "蓋付き夜間容器の専用台",
      "owner": "オットーとクララの世帯",
      "source": "ハインリヒの専用陶器とゴットフリートの低い台",
      "rect": [
        6,
        8,
        1,
        1
      ],
      "access": [
        [
          5,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "夜間容器を使う",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ],
      "transport_container": {
        "shape": "cylinder",
        "id": "container-h8-parents-night",
        "stream": "excreta",
        "material": "glazed_ceramic",
        "lidded": true,
        "outer_diameter_m": 0.24,
        "outer_height_m": 0.22,
        "inner_diameter_m": 0.228,
        "usable_depth_m": 0.16,
        "capacity_l": 4,
        "empty_mass_kg": 2.8
      }
    }
  ],
  "issues": [
    "戸と枠・操作する身体・窓と換気の立体照合は未完了",
    "便所・灰・汚水の搬出先、容器容量と日課・描画の照合は未完了"
  ],
  "sleeping_places": [
    {
      "id": "bed-h8-3-1",
      "resident": "resident-オットー",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "家具の占有と使用面を配置。容量と開閉は未照合",
      "storage_id": "storage-h8-3-1",
      "storage_symbol": "C"
    },
    {
      "id": "bed-h8-3-2",
      "resident": "resident-クララ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "家具の占有と使用面を配置。容量と開閉は未照合",
      "storage_id": "storage-h8-3-2",
      "storage_symbol": "F"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h8",
    "facility-h8-privy",
    "facility-h8-treatment",
    "facility-h8-nonfood-plot",
    "resident-オットー",
    "resident-クララ"
  ],
  "personal_storage": [
    {
      "id": "storage-h8-3-1",
      "resident": "resident-オットー",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人専用の箱"
    },
    {
      "id": "storage-h8-3-2",
      "resident": "resident-クララ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "F",
      "compartment": "本人専用の箱"
    }
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-オットー",
    "resident-クララ"
  ],
  "material_routes": [
    {
      "stream": "excreta",
      "to": "facility-h8-treatment",
      "container_id": "container-h8-parents-night",
      "status": "proposed",
      "container_symbol": "N",
      "carry_plan": {
        "carrier": "resident-オットー",
        "max_fill_l": 4
      }
    }
  ]
}
---
# オットーとクララの家／2階 寝室

## 両親の寝室

オットーとクララにそれぞれ寝台と専用の衣服箱を割り当てる。二人用寝台という現行の候補で寝具を共用したことにせず、各人の眠る場所を持つ。店の商品の籠と客の洗濯物は寝台や衣服箱へ置かない。

共用通路の戸から中央の床を通り、それぞれの寝台の側面へ行く。仕事の時刻が異なる二人の灯りと着替え、窓と寝具の手入れ、戸と箱の開閉は別に照合する。

## 平面

一セルは半メートル。隣室と共有する壁と戸口は建物の原点で合わせる。

```grid
#########
#CC...FF#
#AA...BB#
#AA...BB#
#AA...BB#
#AA...BB#
#.......#
D.......#
D.....N.#
#.......#
#########
```

## 夜間の容器

蓋付きの夜間容器を衣服箱と分けて専用台へ置く。夜中に寒い外へ出ずに使える場所を持ち、オットーかクララが蓋を閉じて処理区画へ運ぶ。ヨナスの部屋には夜の見守りと容器の手入れのため両親も入れるが、両親の寝床が増えたことにはしない。容器の開閉と持ち上げ、容量・匂い・換気、実際の搬送と日課は未照合である。

## 容器と置き場所

搬送に使う容器のIDを家具の transport_container へ結び付ける。円筒の外径・高さと内径・使う深さ、容量、空の重さを設計値として持ち、台の占有内に収まることと内側の容積を超えないことを照合する。蓋の固定、持ち上げる姿勢、充填上限時の重さと通路・階段の搬送はまだ確認していない。

## 運搬時の充填上限

carry_plan で担当者と運搬時の充填上限を指定する。容器の容量と運搬に使う量を分け、上限の線に達したら蓋を閉じて一容器ずつ扱う。中身の質量は設計用の密度上限の仮定で計算し、空容器を加える。容器が容量まで入ることだけで運べるとはせず、担当者の仮の上限と照合する。実能力、把手や蓋、運ぶ頻度と経路はまだ確認していない。
