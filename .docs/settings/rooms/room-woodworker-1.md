---
{
  "id": "room-woodworker-1",
  "kind": "rooms",
  "title": "ゴットフリートの木工所／1階 店先",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-woodworker",
  "floor": 0,
  "room_name": "店先",
  "use": "店",
  "occupants": [
    "ゴットフリート",
    "アントン"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#######",
      "#PPFFF#",
      "#.....#",
      "D.....#",
      "D.....#",
      "#.....#",
      "#.....#",
      "#RRR..#",
      "#.....#",
      "#.....#",
      "#.....#",
      "#.....#",
      "#.....#",
      "#.....#",
      "#.....#",
      "#DDDD##"
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
      "target": "map-phanthiet-craft",
      "door": [
        1,
        15
      ],
      "width_cells": 4
    },
    {
      "kind": "door",
      "target": "room-woodworker-2",
      "door": [
        0,
        3
      ],
      "width_cells": 2,
      "target_door": [
        9,
        3
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "F",
      "name": "完成した弓と木工品の棚",
      "owner": "ゴットフリート",
      "source": "木工所で組む木製の家具",
      "rect": [
        3,
        1,
        3,
        1
      ],
      "access": [
        [
          4,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "完成品を並べて客へ出す",
          "rect": [
            3,
            2,
            3,
            2
          ]
        }
      ],
      "role": "finished_storage"
    },
    {
      "symbol": "P",
      "name": "修理の預かり棚",
      "owner": "ゴットフリート",
      "source": "木工所で組む木製の家具",
      "rect": [
        1,
        1,
        2,
        1
      ],
      "access": [
        [
          1,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "持ち主を確かめて預かり品を出し入れする",
          "rect": [
            1,
            2,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "R",
      "name": "弓と代金の受渡し台",
      "owner": "ゴットフリート",
      "source": "木工所で組む木製の家具",
      "rect": [
        1,
        7,
        3,
        1
      ],
      "access": [
        [
          2,
          6
        ],
        [
          2,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "台の裏で品と代金を扱う",
          "rect": [
            1,
            5,
            3,
            2
          ]
        },
        {
          "activity": "客が台の前で品を受け取る",
          "rect": [
            1,
            8,
            3,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "両開き戸の保持金具と立体の姿勢、長材の搬入と旋回は未設計",
    "売り台の脇の通り道に客が入らない仕切りと跳ね板は未設計",
    "完成品と預かり品の容量・客の待つ場所と雨の日の荷は未照合"
  ],
  "design_dependencies": [
    "building-woodworker",
    "room-woodworker-2",
    "map-phanthiet-craft",
    "resident-ゴットフリート",
    "resident-アントン"
  ],
  "origin": [
    9,
    0
  ],
  "door_leaves": [
    {
      "door": [
        1,
        15
      ],
      "hinge": "start",
      "paired": true,
      "frame_inset_m": 0.05,
      "thickness_m": 0.04,
      "waits_for": [],
      "paired_sequence": {
        "first": "start",
        "start": {
          "body_radius_m": 0.4,
          "orbit_radius_m": 1.4,
          "start_deg": 20,
          "end_deg": 70,
          "waits_for": []
        },
        "end": {
          "body_radius_m": 0.4,
          "orbit_radius_m": 1.4,
          "start_deg": 20,
          "end_deg": 70,
          "waits_for": []
        },
        "transfer_points_m": [
          [
            1.028828200656,
            6.184430330899728
          ],
          [
            1.1344303309,
            7.021171799344064
          ]
        ]
      },
      "meeting_gap_m": 0.01
    },
    {
      "door": [
        0,
        3
      ],
      "hinge": "start",
      "frame_inset_m": 0.05,
      "thickness_m": 0.04,
      "waits_for": [
        {
          "furniture": "P",
          "space_index": 0,
          "reason": "預かり棚の前を空けてから、工房との戸を店先側へ開く"
        }
      ],
      "operation": {
        "body_radius_m": 0.4,
        "orbit_radius_m": 1.5,
        "start_deg": 20,
        "end_deg": 70,
        "waits_for": [
          {
            "furniture": "F",
            "space_index": 0,
            "reason": "完成品の棚の前で品を出し終え、床を空けてから戸を扱う"
          },
          {
            "furniture": "R",
            "space_index": 0,
            "reason": "売り台の裏で品と代金を扱い終え、床を空けてから戸を扱う"
          }
        ]
      }
    }
  ],
  "cargo_routes": [
    {
      "activity": "戸を開けて店先へ入った後、短材を戸の内側の一時荷受け床へ運ぶ",
      "length_m": 1.4,
      "width_m": 0.8,
      "clearance_m": 0.1,
      "points_m": [
        [
          1.5,
          6.6
        ],
        [
          1.5,
          5.4
        ]
      ]
    }
  ]
}
---

# ゴットフリートの木工所／1階 店先

## 客を迎える場所

職人通りの戸から入った客は、ここで[[resident-ゴットフリート]]から弓と木工品を受け取り、修理の品を預ける。売り台の裏の戸から[[room-woodworker-2]]へ通じるが、客は工房へ入らない。刃物・木屑・仕掛品を店先へ持ち出さない。

## 品の置き場

北の壁に修理の預かり棚と完成した弓と木工品の棚を並べ、売り台の裏から扱う。売り台の裏の戸は工房側へは開かず店先側へ開く案とし、戸を扱う間は棚と売り台の裏の床を空ける。完成品と預かり品を別の棚に分け、持ち主を確かめずに渡さない。

## 戸と短材の搬入

南の幅広い戸口は客と短材の出入りに使う案であり、左右の枠と二枚の内開き板の回転範囲を平面で検査する。西側の板を先に開き、その板を保持して東側の取っ手へ移る。逆順に閉める。戸の内側の床は短材を一時に受ける場所とし、荷を置いたままの倉庫にしない。短材はそこから売り台の脇を通って工房の置き場へ運ぶが、その持ち替えと長材の旋回、屋外から戸を越える動作は示さない。

## 平面案

一セルは半メートル。東西に狭く南北に長い店先で、売り台が客の床と店主の床を分ける。保持金具と雨風の止め、立体の姿勢、売り台の脇の仕切りは未設計である。

```grid
#######
#PPFFF#
#.....#
D.....#
D.....#
#.....#
#.....#
#RRR..#
#.....#
#.....#
#.....#
#.....#
#.....#
#.....#
#.....#
#DDDD##
```
