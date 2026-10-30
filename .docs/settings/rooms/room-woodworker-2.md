---
{
  "id": "room-woodworker-2",
  "kind": "rooms",
  "title": "ゴットフリートの木工所／2階 屋根裏の寝間",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-woodworker",
  "floor": 1,
  "room_name": "屋根裏の寝間",
  "use": "寝",
  "occupants": [
    "ゴットフリート",
    "アントン"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####DD####",
      "#GG.......#",
      "#GG....AA.#",
      "#GG....AA.#",
      "#GG....AA.#",
      "#......AA.#",
      "#CC....FF.#",
      "###########"
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
      "target": "room-woodworker-kitchen",
      "door": [
        5,
        0
      ],
      "width_cells": 2,
      "target_door": [
        5,
        8
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "G",
      "name": "ゴットフリートの寝台",
      "owner": "ゴットフリート",
      "source": "木工所で組む木製の家具",
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
          "activity": "寝具を整えて横になる",
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
      "symbol": "A",
      "name": "アントンの寝台",
      "owner": "アントン",
      "source": "木工所で組む木製の家具",
      "rect": [
        7,
        2,
        2,
        4
      ],
      "access": [
        [
          6,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "寝具を整えて横になる",
          "rect": [
            5,
            3,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "C",
      "name": "ゴットフリートの衣服箱",
      "owner": "ゴットフリート",
      "source": "木工所で組む木製の家具",
      "rect": [
        1,
        6,
        2,
        1
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "衣服と私物を出し入れする",
          "rect": [
            3,
            5,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "ゴットフリート"
      ],
      "compartments": [
        "本人の区画"
      ]
    },
    {
      "symbol": "F",
      "name": "アントンの衣服箱",
      "owner": "アントン",
      "source": "木工所で組む木製の家具",
      "rect": [
        7,
        6,
        2,
        1
      ],
      "access": [
        [
          6,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "衣服と私物を出し入れする",
          "rect": [
            5,
            5,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "アントン"
      ],
      "compartments": [
        "本人の区画"
      ]
    }
  ],
  "issues": [
    "寝具と箱の容量・着替えと蓋・夜の目隠しは未照合",
    "屋根の梁と床・工房の音と埃・換気と火の立体照合未完了",
    "戸と金具・就寝前後の動きと日課は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-woodworker-2-1",
      "resident": "resident-ゴットフリート",
      "kind": "個別寝台",
      "grid_symbol": "G",
      "storage_status": "本人の衣服箱へ配置。容量と可動域は未照合",
      "storage_id": "storage-woodworker-2-1",
      "storage_symbol": "C"
    },
    {
      "id": "bed-woodworker-2-2",
      "resident": "resident-アントン",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "本人の衣服箱へ配置。容量と可動域は未照合",
      "storage_id": "storage-woodworker-2-2",
      "storage_symbol": "F"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-woodworker",
    "room-woodworker-kitchen",
    "resident-ゴットフリート",
    "resident-アントン"
  ],
  "personal_storage": [
    {
      "id": "storage-woodworker-2-1",
      "resident": "resident-ゴットフリート",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人の区画"
    },
    {
      "id": "storage-woodworker-2-2",
      "resident": "resident-アントン",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "F",
      "compartment": "本人の区画"
    }
  ],
  "origin": [
    5,
    8
  ],
  "private_for": [
    "resident-ゴットフリート",
    "resident-アントン"
  ],
  "door_leaves": [
    {
      "door": [
        5,
        0
      ],
      "hinge": "end",
      "frame_inset_m": 0.05,
      "thickness_m": 0.04,
      "waits_for": [],
      "operation": {
        "body_radius_m": 0.4,
        "orbit_radius_m": 1.5,
        "start_deg": 20,
        "end_deg": 70,
        "waits_for": [
          {
            "furniture": "G",
            "space_index": 0,
            "reason": "ゴットフリートが寝具を整える作業と寝台への出入りを終え、使用面を空けてから戸を扱う"
          },
          {
            "furniture": "A",
            "space_index": 0,
            "reason": "アントンが寝具を整える作業と寝台への出入りを終え、使用面を空けてから戸を扱う"
          }
        ]
      }
    }
  ]
}
---

# ゴットフリートの木工所／2階 屋根裏の寝間

## 父子の寝床と衣服

ゴットフリートとアントンにそれぞれ常用寝台と衣服箱を置き、既存の固有IDへ結び付ける。二人の寝具と衣服は、仕事の材料・道具・完成品・客の預かり品の収納と重複させない。働きに来るニクラスの寝床を、この家の父子の枠で満たさない。

## 居住部のつながり

[[room-woodworker-kitchen]]から入る家族の寝間であり、工房の客や材料の搬入経路として通り抜けない。寝台を戸の開閉域から外し、着替えと衣服箱の床を本人ごとに取る。戸と枠・身体の操作の平面を持つが、金具と姿勢・目隠し・夜の灯りは引き続き照合する。

## 平面案


屋根の下面と使用面は断面へ対応させる。工房からの音と埃、梁と床、窓と換気を閉じてから描画する。

## 戸を扱う身体と作業の順番

ゴットフリートが寝具を整える作業と寝台への出入りを終え、使用面を空けてから戸を扱う。アントンが寝具を整える作業と寝台への出入りを終え、使用面を空けてから戸を扱う。戸板の回転とは別に、開閉する身体の円弧と家具の使用面を照合する。同時使用できる面としては扱わず、待つ人の位置と道側からの操作・人の移動の連続は別に照合する。

```grid
#####DD####
#GG.......#
#GG....AA.#
#GG....AA.#
#GG....AA.#
#......AA.#
#CC....FF.#
###########
```
