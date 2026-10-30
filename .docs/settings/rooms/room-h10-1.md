---
{
  "id": "room-h10-1",
  "kind": "rooms",
  "title": "修道士の家／1階 書斎兼台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h10",
  "floor": 0,
  "room_name": "書斎兼台所",
  "use": "家庭の炊事・食事、書き物と祈り",
  "occupants": [
    "ベネディクト",
    "クレメンス"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD########",
      "#SS......BBB.#",
      "#SS..........#",
      "#SS..........#",
      "#SS......RRR.#",
      "#SS..PP..RRR.#",
      "#SS..PP...C..#",
      "#SS..........#",
      "#SS..A.......#",
      "#SS..TT......#",
      "#SS..TTE..LL.#",
      "#SS..........#",
      "#SS..........#",
      "#............#",
      "#....WW......#",
      "#.........FF.#",
      "#.K.......FF.#",
      "##############"
    ]
  },
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
      "kind": "stair",
      "target": "room-h10-2",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        3,
        12
      ],
      "target_access": [
        3,
        1
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "寝間への直階段",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        1,
        1,
        2,
        12
      ],
      "access": [
        [
          3,
          12
        ]
      ],
      "use_space": [
        {
          "activity": "寝間への直階段を使う",
          "rect": [
            3,
            11,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "P",
      "name": "女神へ祈る小さな台",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        5,
        5,
        2,
        2
      ],
      "access": [
        [
          4,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "女神へ祈る小さな台を使う",
          "rect": [
            3,
            5,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "table",
      "runtime_solid": true,
      "work_surface": {
        "height_m": 0.8,
        "thickness_m": 0.04,
        "leg_width_m": 0.05,
        "leg_inset_m": 0.2,
        "knee_clearance_m": 0.18
      }
    },
    {
      "symbol": "B",
      "name": "記録と祈りの言葉の本棚",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        9,
        1,
        3,
        1
      ],
      "access": [
        [
          9,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "記録と祈りの言葉の本棚を使う",
          "rect": [
            9,
            2,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "shelf",
      "runtime_solid": true,
      "shelf": {
        "height_m": 1.5,
        "board_thickness_m": 0.025,
        "board_tops_m": [
          0.15,
          0.6,
          1.05,
          1.5
        ],
        "front": "s"
      }
    },
    {
      "symbol": "R",
      "name": "記録を書く机",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        9,
        4,
        3,
        2
      ],
      "access": [
        [
          8,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "記録を書く机を使う",
          "rect": [
            7,
            4,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "C"
      ],
      "runtime_kind": "table",
      "runtime_solid": true,
      "work_surface": {
        "height_m": 0.66,
        "thickness_m": 0.04,
        "leg_width_m": 0.05,
        "leg_inset_m": 0.3,
        "knee_clearance_m": 0.18
      }
    },
    {
      "symbol": "C",
      "name": "書き物の椅子",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        10,
        6,
        1,
        1
      ],
      "access": [
        [
          10,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "書き物の椅子を使う",
          "rect": [
            10,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.44,
        "depth_m": 0.44,
        "height_m": 0.36,
        "back_height_m": 0.88,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04,
        "facing": "n"
      }
    },
    {
      "symbol": "T",
      "name": "二人の食卓",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        5,
        9,
        2,
        2
      ],
      "access": [
        [
          7,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "二人の食卓を使う",
          "rect": [
            7,
            8,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "A",
        "E"
      ],
      "role": "table",
      "runtime_kind": "table",
      "runtime_solid": true,
      "work_surface": {
        "height_m": 0.66,
        "thickness_m": 0.04,
        "leg_width_m": 0.05,
        "leg_inset_m": 0.3,
        "knee_clearance_m": 0.18
      }
    },
    {
      "symbol": "A",
      "name": "ベネディクトの食事の椅子",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        5,
        8,
        1,
        1
      ],
      "access": [
        [
          6,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "ベネディクトの食事の椅子を使う",
          "rect": [
            6,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.44,
        "depth_m": 0.44,
        "height_m": 0.36,
        "back_height_m": 0.88,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04,
        "facing": "s"
      }
    },
    {
      "symbol": "E",
      "name": "クレメンスの食事の椅子",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        7,
        10,
        1,
        1
      ],
      "access": [
        [
          8,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "クレメンスの食事の椅子を使う",
          "rect": [
            8,
            10,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.44,
        "depth_m": 0.44,
        "height_m": 0.36,
        "back_height_m": 0.88,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04,
        "facing": "w"
      }
    },
    {
      "symbol": "F",
      "name": "家庭の調理炉",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "石工のマルクスへ石積みの炉と煙道の製作・修繕を頼む案",
      "rect": [
        10,
        15,
        2,
        2
      ],
      "access": [
        [
          9,
          16
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の調理炉を使う",
          "rect": [
            7,
            14,
            3,
            3
          ]
        }
      ],
      "runtime_kind": "hearth",
      "runtime_solid": true,
      "maintainers": [
        "resident-ベネディクト",
        "resident-クレメンス"
      ],
      "hearth_front": "w",
      "hearth": {
        "height_m": 0.7,
        "opening_bottom_m": 0.06,
        "opening_top_m": 0.48,
        "opening_width_m": 0.4,
        "opening_offset_m": -0.2,
        "chamber_depth_m": 0.9
      },
      "hearth_maintenance": {
        "operator": "resident-クレメンス",
        "space_index": 0,
        "body_m": [
          4.35,
          7.75
        ],
        "body_radius_m": 0.4,
        "state": "cold_empty",
        "tool": {
          "name": "灰かき用の小さな鉄の掻き出し具",
          "owner": "ベネディクトとクレメンスの世帯",
          "source": "鍛冶屋のギュンターへ古い鉄を材料として製作を頼む案",
          "maintainers": [
            "resident-クレメンス"
          ],
          "length_m": 1.1,
          "blade_width_m": 0.18,
          "blade_thickness_m": 0.008,
          "storage_status": "unverified",
          "storage": {
            "furniture": "K",
            "item": "hearth-tool"
          }
        },
        "grip_m": [
          4.9,
          8.2
        ],
        "carry": {
          "posture": "upright",
          "return": "reverse",
          "poses": [
            {
              "body_m": [
                1.25,
                7.1
              ],
              "turn": 0
            },
            {
              "body_m": [
                2,
                7.1
              ],
              "turn": 0
            },
            {
              "body_m": [
                2,
                6
              ],
              "turn": 0
            },
            {
              "body_m": [
                4.4,
                6
              ],
              "turn": 0
            },
            {
              "body_m": [
                4.4,
                6.2
              ],
              "turn": 0
            },
            {
              "body_m": [
                4.4,
                6.2
              ],
              "turn": 3
            }
          ]
        },
        "handoff": {
          "grip_from_blade_m": 1.0537958926920339,
          "staging_body_m": [
            4.4,
            6.2
          ],
          "steps": [
            {
              "grip_m": [
                4.921,
                1.15,
                6.2
              ],
              "body_m": [
                4.4,
                6.2
              ],
              "orientation": "carry_vertical"
            },
            {
              "grip_m": [
                4.921,
                1.15,
                6.75
              ],
              "body_m": [
                4.4,
                6.2
              ],
              "orientation": "carry_vertical"
            },
            {
              "grip_m": [
                4.5,
                1.15,
                6.75
              ],
              "body_m": [
                4.4,
                6.2
              ],
              "orientation": "carry_vertical"
            },
            {
              "grip_m": [
                4.5,
                1.15,
                6.75
              ],
              "body_m": [
                4.4,
                6.2
              ],
              "orientation": "work_vertical"
            },
            {
              "grip_m": [
                4.5,
                1.15,
                6.75
              ],
              "body_m": [
                4.4,
                6.2
              ],
              "orientation": "work_horizontal"
            },
            {
              "grip_m": [
                3.85,
                1.15,
                6.75
              ],
              "body_m": [
                4.4,
                6.2
              ],
              "orientation": "work_horizontal"
            },
            {
              "grip_m": [
                3.85,
                1,
                6.75
              ],
              "body_m": [
                4.4,
                6.2
              ],
              "orientation": "work_horizontal"
            },
            {
              "grip_m": [
                3.85,
                1,
                8.2
              ],
              "body_m": [
                4.4,
                7.65
              ],
              "orientation": "work_horizontal"
            },
            {
              "grip_m": [
                3.85,
                0.4,
                8.2
              ],
              "body_m": [
                4.4,
                7.65
              ],
              "orientation": "work_horizontal"
            },
            {
              "grip_m": [
                3.85,
                0.4,
                8.2
              ],
              "body_m": [
                4.4,
                7.65
              ],
              "orientation": "work_sloped"
            },
            {
              "grip_m": [
                4.9,
                0.4,
                8.2
              ],
              "body_m": [
                4.35,
                7.75
              ],
              "orientation": "work_sloped"
            }
          ],
          "stage_area": [
            7,
            11,
            4,
            3
          ]
        },
        "grip_height_m": 0.4,
        "work_pose_candidate": {
          "animation": "scrub",
          "frame": 0,
          "body_m": [
            4.55,
            8.1
          ],
          "facing": "e",
          "hand": "r",
          "pole": [
            -1,
            0,
            1
          ],
          "stroke_motion": "fixed_support",
          "shoe_contacts": [
            "shoe_l",
            "shoe_r"
          ],
          "kneeling": {
            "pelvis_drop_m": 0.015,
            "knee": "r"
          },
          "stroke_clearance": "unverified"
        }
      }
    },
    {
      "symbol": "W",
      "name": "家庭の飲用水の蓋付き容器台",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        5,
        14,
        2,
        1
      ],
      "access": [
        [
          5,
          15
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の飲用水の蓋付き容器台を使う",
          "rect": [
            5,
            15,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "L",
      "name": "二人の食材棚",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        10,
        10,
        2,
        1
      ],
      "access": [
        [
          10,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "二人の食材棚を使う",
          "rect": [
            10,
            11,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "shelf",
      "runtime_solid": true,
      "shelf": {
        "height_m": 1.2,
        "board_thickness_m": 0.025,
        "board_tops_m": [
          0.15,
          0.5,
          0.85,
          1.2
        ],
        "front": "s"
      }
    },
    {
      "symbol": "K",
      "name": "炉の手入れ道具の開放棚",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "木工のゴットフリートへ板の棚の製作を頼む案",
      "maintainers": [
        "resident-クレメンス"
      ],
      "rect": [
        2,
        16,
        1,
        1
      ],
      "access": [
        [
          2,
          15
        ]
      ],
      "role": "tool_storage",
      "runtime_kind": "shelf",
      "runtime_solid": true,
      "use_space": [
        {
          "activity": "冷えた炉の道具を取り出して戻す",
          "rect": [
            1,
            13,
            3,
            3
          ]
        }
      ],
      "shelf": {
        "height_m": 1.4,
        "board_thickness_m": 0.025,
        "board_tops_m": [
          0.05,
          1.4
        ],
        "front": "n",
        "contents": [
          {
            "id": "hearth-tool",
            "name": "灰かき用の小さな鉄の掻き出し具",
            "owner": "ベネディクトとクレメンスの世帯",
            "source": "鍛冶屋のギュンターへ古い鉄を材料として製作を頼む案",
            "kind": "tool",
            "board": 0,
            "across_m": 0,
            "from_back_m": 0.35,
            "width_m": 0.18,
            "height_m": 1.1,
            "depth_m": 0.008,
            "tool": {
              "handle_width_m": 0.006,
              "blade_length_m": 0.12
            },
            "retrieval": {
              "withdraw_m": 0.5,
              "body_radius_m": 0.4,
              "body_across_m": 0,
              "body_start_m": 0.65,
              "body_end_m": 0.9,
              "space_index": 0
            }
          }
        ]
      }
    }
  ],
  "issues": [
    "窓・梁・戸の開閉と操作、火気と換気の立体は未照合",
    "便所・給排水・薪と灰、収納容量・日課と描画は未照合",
    "支持を固定した左右の作業で、腕と身体自身の干渉、手首の可動域、指の関節と柄の接触、握力、支持面・荷重と重心は未照合である。"
  ],
  "design_dependencies": [
    "building-h10",
    "resident-ベネディクト",
    "resident-クレメンス",
    "resident-マルクス",
    "resident-ギュンター",
    "resident-ゴットフリート"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ベネディクト",
        "chair": "A"
      },
      {
        "resident": "resident-クレメンス",
        "chair": "E"
      }
    ]
  },
  "origin": [
    0,
    0
  ],
  "door_leaves": [
    {
      "door": [
        4,
        0
      ],
      "hinge": "start",
      "frame_inset_m": 0.025,
      "thickness_m": 0.04,
      "waits_for": [],
      "owner": "ベネディクトとクレメンスの世帯",
      "maintainers": [
        "resident-ベネディクト",
        "resident-クレメンス"
      ],
      "source": "町の木工所へ製作と修理を頼む内開きの板戸の案",
      "operation": {
        "body_radius_m": 0.4,
        "orbit_radius_m": 1.4,
        "start_deg": 20,
        "end_deg": 70,
        "waits_for": []
      },
      "push_operation": {
        "body_radius_m": 0.4,
        "poses": [
          {
            "angle_deg": 0,
            "body_m": [
              0.475,
              -0.5
            ]
          },
          {
            "angle_deg": 20,
            "body_m": [
              0.475,
              -0.3
            ]
          },
          {
            "angle_deg": 30,
            "body_m": [
              0.52,
              -0.24
            ]
          },
          {
            "angle_deg": 45,
            "body_m": [
              0.53,
              -0.1
            ]
          },
          {
            "angle_deg": 60,
            "body_m": [
              0.54,
              0.04
            ]
          },
          {
            "angle_deg": 70,
            "body_m": [
              0.54,
              0.15
            ]
          },
          {
            "angle_deg": 80,
            "body_m": [
              0.54,
              0.32
            ]
          },
          {
            "angle_deg": 90,
            "body_m": [
              0.54,
              0.5
            ]
          }
        ]
      },
      "wall_depth_cells": 1,
      "vertical_clearance_m": {
        "bottom": 0.01,
        "top": 0.005
      },
      "fittings": {
        "brace_projection_m": 0.006,
        "handle_projection_m": 0.02,
        "handle_along_m": 0.83
      }
    }
  ]
}
---
# 修道士の家／1階 書斎兼台所

## 二人が暮らす書斎と台所

ベネディクトとクレメンスが女神へ祈り、町の記録を書き、家で食べる分を調理する。書き物机と食卓を分け、記録を配膳や洗い物の置場に使わない。二人に別々の食事の椅子を持たせる。

小さな祈りの台は家庭内の祈りに使う。町の人を迎える礼拝堂と治癒の場所、寄進で炊く粥の受渡し、首飾りを彫る場所と薬を煎じる仕事は、この家具だけで充足したことにしない。炉と書物の火気隔離、明かり、給水・洗い物と煙の経路は立体と設備で詰める。

入口から食卓と階段へ行けるようにし、客を屋根裏の寝間へ案内する設計にしない。

## 平面案

一セルは半メートル。階段は両階の同じ占有へ合わせる。

```grid
####DD########
#SS......BBB.#
#SS..........#
#SS..........#
#SS......RRR.#
#SS..PP..RRR.#
#SS..PP...C..#
#SS..........#
#SS..A.......#
#SS..TT......#
#SS..TTE..LL.#
#SS..........#
#SS..........#
#............#
#....WW......#
#.........FF.#
#.K.......FF.#
##############
```

## 入口の戸と外の踊り場

北壁の入口は敷地の回転後には西へ向き、内側へ開く。家具と階段の使用面から戸板の厚さを含む回転範囲を空ける。外側は [[building-h10]] の入口階段の上の踊り場へつなぎ、戸を開けるために段の上へ後退させない。室内側の身体の円弧と戸板・家具・使用面との距離を照合する。押して入る身体の平面と、取っ手へ手が届く範囲を保って閉め始める位置へ移る区間を照合する。腕と上半身・荷物、戸の重さと保持の金具、枠と蝶番の固定、別の人の待機と立体は未照合である。

## 戸を扱う身体と祈る場所

祈りの台は入口近くの北壁際から、書き物の場所の西隣へ移す。開閉する人の身体と、祈る人の使用場所を重ねず、戸の開閉を祈りが終わるまで待つことを通常の利用条件にしない。台の用途・持ち主・大きさは維持し、祈る人の立ち位置も台に接した空いた床へ移す。扉の operation は室内側で取っ手に手が届き、戸板の回転範囲の外側を動く身体の平面を表す。

## 外から入って戸を閉めるまで

外ではまず入口の正面を保って進み、身体の足元が入口へ入ってから横へ寄る。初めから横へ寄る経路は、狭い踊り場の角で身体の支える床が欠けるため採用しない。戸板へ身体を重ねず、取っ手へ手が届く範囲を保って室内へ入る。開いた戸から手が届く位置を保ちながら、室内側の閉め始める位置へ移り、operation の経路を逆に辿って閉める。

push_operation の各姿勢だけでなく、姿勢の間の連続した経路も検査する。身体の大きさと踊り場の幅を小さくして通過させない。腕の握りと保持の金具、戸板の重さ、荷物と別の人の待機、実際の歩行と戸の動きの描画は引き続き詰める。

## 入口戸の上下の納まり

修道士二人の入口戸は内壁面へ取り付け、完成した床と開口上端から逃がす。具体的な取付位置と隙間は door_leaves に持たせ、寸法の意味は [[town#戸板の取付断面]] に従う。雨仕舞い・木の伸縮・金具の固定強度は未照合である。

## 戸板から突出する部品

入口戸の取っ手と補強材は fittings の寸法を使い、[[town#戸板の取付断面]] に従って開閉を照合する。

## 机と食卓の着席方向

食卓は二人の椅子を北側と東側へ分け、それぞれ卓へ向ける。書き物の椅子は机の南側から北へ向く。西側の空いた使用面は机の横で記録を出し入れする場所として保ち、椅子への出入りとは分ける。天板の下面と座面の差を膝の空間として照合する。祈る台は立って使い、食事や書き物の席には割り当てない。身体の膝と脚の実際の立体、座る動作、同時利用と日課への反映は引き続き照合する。

## 身体に合わせる座面

二人の椅子と机・食卓は身体に合わせて低く製作する。着席した腿の下面を座面へ置いたときに、両足の靴底が床へ接する高さを使う。座面を下げた分は机と食卓にも反映する。祈る台の高さは立って使う設計のままとする。食事と筆記の腕の動き、椅子を引く動作は未照合である。

## 卓の脚と足先

食卓と書き物机の脚は内側へ寄せ、座った身体の靴が脚へ当たらない位置にする。脚の位置は work_surface の寸法を使い、描画だけでずらさない。足裏の接地と膝の空間に加え、靴の踵から爪先までの太さを含む範囲を卓の脚へ照合する。天板の張り出しを含む強度と、席へ入る際に身体が通る区間は引き続き設計する。

## 本棚と食材棚の部材

本棚と食材棚は南の使用面へ開く。側板と背板を完成床まで下ろし、棚板を側板の内側へ納める。shelf の board_tops_m は棚板の上面を表す。保管に使える高さは次の棚板の下面までとし、棚板の厚みを容量へ含めない。中身は用途に沿って設計するが、本や食材の数量と容器を未確認の飾りで補わない。中身の寸法・取り出す区間と供給、清掃の方法は引き続き照合する。

## 炉から屋根までの煙道

炉と煙道は [[resident-マルクス]] に依頼する石積みとし、木製家具の製作元とは分ける。地上階の炉を南へ寄せ、上階の寝台の足側から離した位置へ同じ断面の煙道を通す。二人が外面と周囲の置き物を点検し、修繕は石工へ頼む。梁と屋根の貫通、掃除口と灰の搬出、燃焼に使う空気と換気、薪の置き場は引き続き設計する。

## 炉口の向き

炉口は hearth_front の使用面へ向け、壁側を焚き口にしない。天端の石も占有する外形の内側へ納める。火の光は炉口側へ置き、梁・屋根と火気、換気と掃除の区間は別に照合する。

家庭の調理炉は西へ開き、南寄りの煙道の内寸へ火室を合わせる。使用位置も焚口の前へ寄せ、背面の壁や炉を横切って使う形にしない。断面の読み方と接続は [[town#炉と煙道の断面]] に従う。調理器具・薪と灰、掃除口と手入れの姿勢、石材と目地・荷重の耐力は未照合である。

クレメンスが炉の西側で手入れする身体位置と道具の寸法案を持つ。手入れの条件は [[town#炉の手入れ]] に従う。道具は専用の開放棚 K へ縦に収め、本や食材とは分ける。棚の内寸と直線の引出し、使用位置まで縦に持つ運搬の平面を照合する。道具の持ち替えの空間手順は `handoff` に持たせる。腕・膝・上体の姿勢と実際の動作、灰の受け容器・搬出は未照合である。

棚から引き出した後は `carry` の身体位置と向きで道具を縦に保って運び、同じ経路を逆に戻す。水の容器の手前を回り、空いた場所でその場の向きを変えてから炉の西側へ寄る。経路の読み方と照合は [[town#炉の道具の運搬]] に従う。

`handoff.stage_area` を道具を持ち上げて向きを変える空いた場所とする。棚から縦に運び終えた姿勢から始め、身体を横切らない経由点を通して持ち上げ、上で向きを変え、焚口の手前で高さを合わせて差し込む。各段階の握りの位置は部屋原点からの x・床からの高さ・z で記す。腕の関節の動きはこの空間の照合だけで証明しない。共通の条件は [[town#炉の道具の持ち替え]] に従う。

持ち上げる高さはキャラクターの骨格の寸法に合わせて下げた。平面の手の到達上限は実際の片腕の長さではないため、この段階で腕が届く姿勢を照合済みとはしない。立ち位置・身体の向きと曲げ、肘と手首、腕と周囲の干渉は実際の骨格で続けて照合する。

炉を使う握りは床より高く保ち、刃を斜めに差し込む。奥の左右へは握りも移して刃を奥壁へ平行にし、元の持ち替え手順と傾きを同じ寸法で照合する。[[town#炉へ差し込む道具の傾き]] に従う。クレメンスが身体を寄せた静止姿勢の候補は `work_pose_candidate` に持ち、[[town#身体の到達と作業姿勢]] の条件へ照合する。持ち替えから候補へ移る身体の動きと、手首・指、日課への反映は未照合である。

作業姿勢候補の `stroke_motion` は両靴と右膝を動かさない `fixed_support` とする。[[town#身体の到達と作業姿勢]] に従い、固定長の腕が左右を結ぶ全区間へ届くことと両端の身体の境界を照合する。腕・袖口と道具から炉・壁・家具までの離隔は全区間へ照合する。道具と固定した身体の離隔も全区間へ照合する。上腕と身体自身の干渉と指の関節・握力は未照合であり、`stroke_clearance` は未確認のままとする。実際の動作と日課はまだ追加しない。

現在の作業姿勢候補の `kneeling` は腰を下げ、両方の靴底と右膝の衣服の表面を床へ合わせる。`shoe_contacts` は左右の靴を指定する。脚の長さは保持し、靴の接地と膝の接触だけで荷重と重心の安定を照合済みとは扱わない。接地の条件は [[town#身体の到達と作業姿勢]] に従う。支持の移替えと動作中の姿勢は引き続き未設計である。

刃と握る腕・手の全体、柄と上腕の離隔、および柄が手首より掌側へ収まることを全区間へ照合する。握る断面は描画する掌の内部へ収めるが、指と柄の接触面の設計が済んだとは扱わない。

掌の開口は実物の柄の断面から組み立て、[[town#作業姿勢の掌と柄の接触]] に従う。指の関節と握力はこの開口とは別に未設計とする。

前腕・掌・袖口と、衣服を含む固定した身体との離隔は [[town#作業する前腕と身体の離隔]] に従い全区間へ照合する。肩の接続と上腕全体の干渉はこの判定に含めない。
