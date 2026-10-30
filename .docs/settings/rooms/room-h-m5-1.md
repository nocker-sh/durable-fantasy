---
{
  "id": "room-h-m5-1",
  "kind": "rooms",
  "title": "町の寄り合い所／1階 集会と読み書き",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-m5",
  "floor": 0,
  "origin": [
    5,
    0
  ],
  "room_name": "1階 集会と読み書き",
  "use": "共用",
  "occupants": [
    "クリスティアン",
    "エーリヒ",
    "ハンナ",
    "フェリックス",
    "フリーダ",
    "イダ",
    "ヨハン",
    "リナ",
    "ラウラ",
    "ベンヤミン"
  ],
  "bed_capacity": 0,
  "guest_capacity": 0,
  "issues": [
    "敷地と道・地形・隣家、外観と全階の構造・戸と窓は未照合",
    "授業と寄り合い・記録の時間と音、往復と給排水・便所・燃料と換気、維持費と立体は未照合",
    "支持を固定した左右の作業で、腕と身体自身の干渉、手首の可動域、指の関節と柄の接触、握力、支持面・荷重と重心は未照合である。",
    "灰を受ける箱の横置き案を持つが、炉床より高い箱の縁を越える灰の移載、道具を扱う身体の遷移と搬送は未照合である。",
    "空箱の運搬の通行幅の経路は、引出し直後の身体位置では実際の両腕が箱へ届かない。近寄る握りの姿勢候補への移行と、その姿勢での経路の再照合は未完了である。",
    "後退は逆再生の描画姿勢の案を持つが、接地と速度・方向の切替は未照合である。横移動は先行する足を出して反対の足を寄せる姿勢の案を持つが、姿勢間の立体の離隔と方向の切替、重心・荷重と実際の速度は未照合である。"
  ],
  "design_dependencies": [
    "building-h-m5",
    "resident-クリスティアン",
    "resident-エーリヒ",
    "map-phanthiet-in-h-m5",
    "resident-ハンナ",
    "resident-フェリックス",
    "resident-フリーダ",
    "resident-イダ",
    "resident-ヨハン",
    "resident-リナ",
    "resident-ラウラ",
    "resident-ベンヤミン",
    "resident-マルクス",
    "resident-ギュンター",
    "resident-ゴットフリート"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#P.......HHH#",
      "#P..IIII.HHH#",
      "#P..IIII....#",
      "#P....e.....#",
      "#P.........N#",
      "#..........N#",
      "#.AAA...BBB.#",
      "#.AAA...BBB.#",
      "#.a.b...c.d.#",
      "#K..........#",
      "#...........#",
      "#..........R#",
      "#CCC....EEE.#",
      "#CCC....EEE.#",
      "#f.g....h.i.#",
      "D...........#",
      "D...........#",
      "#...........#",
      "#####DD######"
    ]
  },
  "furniture": [
    {
      "symbol": "P",
      "name": "壁の読み書き用の板",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        1,
        1,
        1,
        5
      ],
      "access": [
        [
          2,
          2
        ]
      ],
      "role": "work_storage",
      "use_space": [
        {
          "activity": "壁の読み書き用の板を使う",
          "rect": [
            2,
            2,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "wall-board",
      "runtime_solid": true,
      "wall_mount": {
        "side": "w",
        "bottom_m": 1,
        "height_m": 0.9
      }
    },
    {
      "symbol": "I",
      "name": "記録と教材を置く共用卓",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        4,
        2,
        4,
        2
      ],
      "access": [
        [
          4,
          4
        ]
      ],
      "role": "table",
      "use_space": [
        {
          "activity": "記録と教材を置く共用卓を使う",
          "rect": [
            4,
            4,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "e"
      ],
      "runtime_kind": "table",
      "runtime_solid": true,
      "work_surface": {
        "height_m": 0.74,
        "thickness_m": 0.04,
        "leg_width_m": 0.06,
        "leg_inset_m": 0.3,
        "knee_clearance_m": 0.18
      }
    },
    {
      "symbol": "e",
      "name": "記録係の椅子",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        6,
        4,
        1,
        1
      ],
      "access": [
        [
          6,
          5
        ]
      ],
      "role": "seat",
      "use_space": [
        {
          "activity": "記録係の椅子を使う",
          "rect": [
            5,
            5,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.4,
        "depth_m": 0.4,
        "height_m": 0.44,
        "back_height_m": 0.9,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04
      }
    },
    {
      "symbol": "H",
      "name": "集会室の炉",
      "owner": "町の寄り合いの共用品",
      "source": "石工のマルクスへ石積みの炉と煙道の製作・修繕を頼み、エーリヒが点検する案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        9,
        1,
        3,
        2
      ],
      "access": [
        [
          10,
          3
        ]
      ],
      "role": "hearth",
      "use_space": [
        {
          "activity": "集会室の炉を使う",
          "rect": [
            9,
            3,
            2,
            3
          ]
        }
      ],
      "runtime_kind": "hearth",
      "runtime_solid": true,
      "hearth_front": "s",
      "hearth": {
        "height_m": 0.7,
        "opening_bottom_m": 0.06,
        "opening_top_m": 0.48,
        "opening_width_m": 0.6,
        "opening_offset_m": 0,
        "chamber_depth_m": 0.9
      },
      "hearth_maintenance": {
        "operator": "resident-エーリヒ",
        "space_index": 0,
        "body_m": [
          5,
          2.15
        ],
        "body_radius_m": 0.4,
        "state": "cold_empty",
        "tool": {
          "name": "灰かき用の小さな鉄の掻き出し具",
          "owner": "町の寄り合いの共用品",
          "source": "鍛冶屋のギュンターへ古い鉄を材料として製作を頼む案",
          "maintainers": [
            "resident-エーリヒ"
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
          5.25,
          1.6
        ],
        "carry": {
          "posture": "upright",
          "return": "reverse",
          "poses": [
            {
              "body_m": [
                1.9,
                5.5
              ],
              "turn": 0
            },
            {
              "body_m": [
                3.2,
                5.5
              ],
              "turn": 0
            },
            {
              "body_m": [
                3.2,
                3
              ],
              "turn": 0
            },
            {
              "body_m": [
                4.6,
                3
              ],
              "turn": 0
            },
            {
              "body_m": [
                5,
                3.1
              ],
              "turn": 0
            }
          ]
        },
        "handoff": {
          "grip_from_blade_m": 1.0537958926920339,
          "staging_body_m": [
            5,
            3.1
          ],
          "steps": [
            {
              "grip_m": [
                4.521,
                1.15,
                2.85
              ],
              "body_m": [
                5,
                3.1
              ],
              "orientation": "carry_vertical"
            },
            {
              "grip_m": [
                4.8,
                1.15,
                2.55
              ],
              "body_m": [
                5,
                3.1
              ],
              "orientation": "carry_vertical"
            },
            {
              "grip_m": [
                5.25,
                1.15,
                2.6
              ],
              "body_m": [
                5,
                3.1
              ],
              "orientation": "carry_vertical"
            },
            {
              "grip_m": [
                5.25,
                1.15,
                2.6
              ],
              "body_m": [
                5,
                3.1
              ],
              "orientation": "work_vertical"
            },
            {
              "grip_m": [
                5.25,
                1.15,
                2.6
              ],
              "body_m": [
                5,
                3.1
              ],
              "orientation": "work_horizontal"
            },
            {
              "grip_m": [
                5.25,
                0.4,
                2.6
              ],
              "body_m": [
                5,
                3.1
              ],
              "orientation": "work_horizontal"
            },
            {
              "grip_m": [
                5.25,
                0.4,
                2.6
              ],
              "body_m": [
                5,
                3.1
              ],
              "orientation": "work_sloped"
            },
            {
              "grip_m": [
                5.25,
                0.4,
                1.6
              ],
              "body_m": [
                5,
                2.15
              ],
              "orientation": "work_sloped"
            }
          ],
          "stage_area": [
            8,
            5,
            3,
            2
          ]
        },
        "grip_height_m": 0.4,
        "work_pose_candidate": {
          "animation": "scrub",
          "frame": 0,
          "body_m": [
            5.13,
            1.9
          ],
          "facing": "n",
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
          "stroke_clearance": "unverified",
          "off_hand": {
            "palm_m": [
              4.85,
              0.4,
              1.8
            ],
            "pole": [
              1,
              0,
              0
            ]
          }
        },
        "ash_receiver": {
          "storage": {
            "furniture": "R",
            "item": "ash-receiver"
          },
          "capacity_l": 10,
          "cold_only": true,
          "status": "unverified",
          "door_approach": {
            "target": "map-phanthiet-market",
            "body_radius_m": 0.4,
            "carry_bottom_m": 0.88,
            "poses": [
              {
                "body_m": [
                  4.6,
                  6.03
                ],
                "turn": 0
              },
              {
                "body_m": [
                  3,
                  6.03
                ],
                "turn": 0
              },
              {
                "body_m": [
                  3,
                  6.03
                ],
                "turn": 1
              },
              {
                "body_m": [
                  3,
                  9.1
                ],
                "turn": 1
              }
            ]
          },
          "lid_rest": {
            "box_support": "floor",
            "furniture": "R",
            "position_m": [
              5.64,
              6.16
            ]
          },
          "receiving": {
            "method": "lift_transfer",
            "position_m": [
              5.5,
              1.9
            ],
            "status": "unverified",
            "approach": {
              "state": "empty",
              "transition": "unverified",
              "poses": [
                [
                  4.6,
                  6.03
                ],
                [
                  3.3,
                  6.03
                ],
                [
                  3.3,
                  3
                ],
                [
                  4.455,
                  3
                ],
                [
                  4.455,
                  2.28
                ]
              ]
            },
            "grip_candidate": {
              "body_m": [
                4.8,
                6.25
              ],
              "facing": "e",
              "poles": {
                "l": [
                  1,
                  0,
                  0
                ],
                "r": [
                  -1,
                  0,
                  0
                ]
              },
              "status": "unverified"
            },
            "transport_candidate": {
              "status": "unverified",
              "model": "fixed_pose_translation",
              "body_path_m": [
                [
                  4.8,
                  6.25
                ],
                [
                  3.3,
                  6.25
                ],
                [
                  3.3,
                  3
                ],
                [
                  4.455,
                  3
                ],
                [
                  4.455,
                  2.28
                ]
              ],
              "gait_review": {
                "animation": "carry",
                "scope": "rendered_phases",
                "status": "unverified",
                "step_plan": [
                  {
                    "direction": "backward",
                    "animation": "carry",
                    "playback": "reverse"
                  },
                  {
                    "direction": "side_left",
                    "animation": "side_step",
                    "playback": null
                  },
                  {
                    "direction": "forward",
                    "animation": "carry",
                    "playback": "forward"
                  },
                  {
                    "direction": "side_left",
                    "animation": "side_step",
                    "playback": null
                  }
                ],
                "side_step": {
                  "stride_m": 0.12,
                  "lift_m": 0.05,
                  "pelvis_drop_m": 0.02,
                  "status": "unverified",
                  "scope": "sampled_poses",
                  "timing": {
                    "min_cycle_s": 0.8,
                    "max_speed_m_s": 0.25,
                    "max_acceleration_m_s2": 0.2,
                    "status": "unverified"
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      "symbol": "A",
      "name": "共用の読み書きの卓",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        2,
        7,
        3,
        2
      ],
      "access": [
        [
          2,
          6
        ]
      ],
      "role": "table",
      "use_space": [
        {
          "activity": "共用の読み書きの卓を使う",
          "rect": [
            2,
            5,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "a",
        "b"
      ],
      "runtime_kind": "table",
      "runtime_solid": true,
      "work_surface": {
        "height_m": 0.74,
        "thickness_m": 0.04,
        "leg_width_m": 0.06,
        "leg_inset_m": 0.3,
        "knee_clearance_m": 0.18
      }
    },
    {
      "symbol": "B",
      "name": "共用の読み書きの卓",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        8,
        7,
        3,
        2
      ],
      "access": [
        [
          8,
          6
        ]
      ],
      "role": "table",
      "use_space": [
        {
          "activity": "共用の読み書きの卓を使う",
          "rect": [
            8,
            5,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "c",
        "d"
      ],
      "runtime_kind": "table",
      "runtime_solid": true,
      "work_surface": {
        "height_m": 0.74,
        "thickness_m": 0.04,
        "leg_width_m": 0.06,
        "leg_inset_m": 0.3,
        "knee_clearance_m": 0.18
      }
    },
    {
      "symbol": "C",
      "name": "共用の読み書きの卓",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        1,
        13,
        3,
        2
      ],
      "access": [
        [
          1,
          12
        ]
      ],
      "role": "table",
      "use_space": [
        {
          "activity": "共用の読み書きの卓を使う",
          "rect": [
            1,
            11,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "f",
        "g"
      ],
      "runtime_kind": "table",
      "runtime_solid": true,
      "work_surface": {
        "height_m": 0.74,
        "thickness_m": 0.04,
        "leg_width_m": 0.06,
        "leg_inset_m": 0.3,
        "knee_clearance_m": 0.18
      }
    },
    {
      "symbol": "E",
      "name": "共用の読み書きの卓",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        8,
        13,
        3,
        2
      ],
      "access": [
        [
          8,
          12
        ]
      ],
      "role": "table",
      "use_space": [
        {
          "activity": "共用の読み書きの卓を使う",
          "rect": [
            8,
            11,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "h",
        "i"
      ],
      "runtime_kind": "table",
      "runtime_solid": true,
      "work_surface": {
        "height_m": 0.74,
        "thickness_m": 0.04,
        "leg_width_m": 0.06,
        "leg_inset_m": 0.3,
        "knee_clearance_m": 0.18
      }
    },
    {
      "symbol": "a",
      "name": "ハンナが授業で使う共用椅子",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        2,
        9,
        1,
        1
      ],
      "access": [
        [
          2,
          10
        ]
      ],
      "role": "seat",
      "use_space": [
        {
          "activity": "ハンナが授業で使う共用椅子を使う",
          "rect": [
            2,
            10,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.4,
        "depth_m": 0.4,
        "height_m": 0.44,
        "back_height_m": 0.9,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04,
        "occupant_forward_m": 0.07,
        "foot_rest": {
          "height_m": 0.187,
          "width_m": 0.36,
          "depth_m": 0.12,
          "forward_m": 0.38,
          "thickness_m": 0.025,
          "under_table": "A"
        }
      }
    },
    {
      "symbol": "b",
      "name": "フェリックスが授業で使う共用椅子",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        4,
        9,
        1,
        1
      ],
      "access": [
        [
          4,
          10
        ]
      ],
      "role": "seat",
      "use_space": [
        {
          "activity": "フェリックスが授業で使う共用椅子を使う",
          "rect": [
            4,
            10,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.4,
        "depth_m": 0.4,
        "height_m": 0.44,
        "back_height_m": 0.9,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04,
        "occupant_forward_m": 0.07,
        "foot_rest": {
          "height_m": 0.179,
          "width_m": 0.36,
          "depth_m": 0.12,
          "forward_m": 0.38,
          "thickness_m": 0.025,
          "under_table": "A"
        }
      }
    },
    {
      "symbol": "c",
      "name": "フリーダが授業で使う共用椅子",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        8,
        9,
        1,
        1
      ],
      "access": [
        [
          8,
          10
        ]
      ],
      "role": "seat",
      "use_space": [
        {
          "activity": "フリーダが授業で使う共用椅子を使う",
          "rect": [
            8,
            10,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.4,
        "depth_m": 0.4,
        "height_m": 0.44,
        "back_height_m": 0.9,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04,
        "occupant_forward_m": 0.07,
        "foot_rest": {
          "height_m": 0.176,
          "width_m": 0.36,
          "depth_m": 0.12,
          "forward_m": 0.38,
          "thickness_m": 0.025,
          "under_table": "B"
        }
      }
    },
    {
      "symbol": "d",
      "name": "イダが授業で使う共用椅子",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        10,
        9,
        1,
        1
      ],
      "access": [
        [
          10,
          10
        ]
      ],
      "role": "seat",
      "use_space": [
        {
          "activity": "イダが授業で使う共用椅子を使う",
          "rect": [
            10,
            10,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.4,
        "depth_m": 0.4,
        "height_m": 0.44,
        "back_height_m": 0.9,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04,
        "occupant_forward_m": 0.07,
        "foot_rest": {
          "height_m": 0.176,
          "width_m": 0.36,
          "depth_m": 0.12,
          "forward_m": 0.38,
          "thickness_m": 0.025,
          "under_table": "B"
        }
      }
    },
    {
      "symbol": "f",
      "name": "ヨハンが授業で使う共用椅子",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        1,
        15,
        1,
        1
      ],
      "access": [
        [
          1,
          16
        ]
      ],
      "role": "seat",
      "use_space": [
        {
          "activity": "ヨハンが授業で使う共用椅子を使う",
          "rect": [
            1,
            16,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.4,
        "depth_m": 0.4,
        "height_m": 0.44,
        "back_height_m": 0.9,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04,
        "occupant_forward_m": 0.07,
        "foot_rest": {
          "height_m": 0.168,
          "width_m": 0.36,
          "depth_m": 0.12,
          "forward_m": 0.38,
          "thickness_m": 0.025,
          "under_table": "C"
        }
      }
    },
    {
      "symbol": "g",
      "name": "リナが授業で使う共用椅子",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        3,
        15,
        1,
        1
      ],
      "access": [
        [
          3,
          16
        ]
      ],
      "role": "seat",
      "use_space": [
        {
          "activity": "リナが授業で使う共用椅子を使う",
          "rect": [
            3,
            16,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.4,
        "depth_m": 0.4,
        "height_m": 0.44,
        "back_height_m": 0.9,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04,
        "occupant_forward_m": 0.07,
        "foot_rest": {
          "height_m": 0.176,
          "width_m": 0.36,
          "depth_m": 0.12,
          "forward_m": 0.38,
          "thickness_m": 0.025,
          "under_table": "C"
        }
      }
    },
    {
      "symbol": "h",
      "name": "ラウラが授業で使う共用椅子",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        8,
        15,
        1,
        1
      ],
      "access": [
        [
          8,
          16
        ]
      ],
      "role": "seat",
      "use_space": [
        {
          "activity": "ラウラが授業で使う共用椅子を使う",
          "rect": [
            8,
            16,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.4,
        "depth_m": 0.4,
        "height_m": 0.44,
        "back_height_m": 0.9,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04,
        "occupant_forward_m": 0.07,
        "foot_rest": {
          "height_m": 0.187,
          "width_m": 0.36,
          "depth_m": 0.12,
          "forward_m": 0.38,
          "thickness_m": 0.025,
          "under_table": "E"
        }
      }
    },
    {
      "symbol": "i",
      "name": "ベンヤミンが授業で使う共用椅子",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        10,
        15,
        1,
        1
      ],
      "access": [
        [
          10,
          16
        ]
      ],
      "role": "seat",
      "use_space": [
        {
          "activity": "ベンヤミンが授業で使う共用椅子を使う",
          "rect": [
            10,
            16,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "chair",
      "runtime_solid": true,
      "seat": {
        "width_m": 0.4,
        "depth_m": 0.4,
        "height_m": 0.44,
        "back_height_m": 0.9,
        "board_thickness_m": 0.04,
        "leg_width_m": 0.04,
        "occupant_forward_m": 0.07,
        "foot_rest": {
          "height_m": 0.179,
          "width_m": 0.36,
          "depth_m": 0.12,
          "forward_m": 0.38,
          "thickness_m": 0.025,
          "under_table": "E"
        }
      }
    },
    {
      "symbol": "N",
      "name": "寄り合いの掲示板",
      "owner": "町の寄り合いの共用品",
      "source": "現行の掲示板を平面案へ引き継ぐ。板と枠の修繕を木工所へ頼む案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        11,
        5,
        1,
        2
      ],
      "access": [
        [
          10,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "掲示を読む",
          "rect": [
            9,
            5,
            2,
            2
          ]
        }
      ],
      "role": "notice_board",
      "runtime_kind": "wall-board",
      "runtime_solid": true,
      "wall_mount": {
        "side": "e",
        "bottom_m": 1,
        "height_m": 0.8
      }
    },
    {
      "symbol": "K",
      "name": "炉の手入れ道具の開放棚",
      "owner": "町の寄り合いの共用品",
      "source": "木工のゴットフリートへ板の棚の製作を頼む案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        1,
        10,
        1,
        1
      ],
      "access": [
        [
          2,
          10
        ]
      ],
      "role": "tool_storage",
      "runtime_kind": "shelf",
      "runtime_solid": true,
      "use_space": [
        {
          "activity": "冷えた炉の道具を取り出して戻す",
          "rect": [
            2,
            10,
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
        "front": "e",
        "contents": [
          {
            "id": "hearth-tool",
            "name": "灰かき用の小さな鉄の掻き出し具",
            "owner": "町の寄り合いの共用品",
            "source": "鍛冶屋のギュンターへ古い鉄を材料として製作を頼む案",
            "kind": "tool",
            "board": 0,
            "across_m": 0,
            "from_back_m": 0.4,
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
              "body_across_m": -0.25,
              "body_start_m": 0.65,
              "body_end_m": 0.9,
              "space_index": 0
            }
          }
        ]
      }
    },
    {
      "symbol": "R",
      "name": "灰箱を置く低い専用棚",
      "owner": "町の寄り合いの共用品",
      "source": "木工のゴットフリートへ板の棚の製作を頼む案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        11,
        12,
        1,
        1
      ],
      "access": [
        [
          10,
          12
        ]
      ],
      "role": "ash_storage",
      "runtime_kind": "shelf",
      "runtime_solid": true,
      "use_space": [
        {
          "activity": "授業と寄り合いが終わった空室で冷えた灰の箱を取り出して戻す",
          "rect": [
            7,
            11,
            4,
            2
          ]
        }
      ],
      "shelf": {
        "height_m": 0.36,
        "board_thickness_m": 0.025,
        "board_tops_m": [
          0.05,
          0.36
        ],
        "front": "w",
        "contents": [
          {
            "id": "ash-receiver",
            "name": "冷えた灰を受ける蓋付きの鉄の箱",
            "owner": "町の寄り合いの共用品",
            "source": "鍛冶屋のギュンターへ薄い鉄板の箱と取り外せる蓋の製作を頼む案",
            "kind": "box",
            "box_material": "iron",
            "board": 0,
            "across_m": 0,
            "from_back_m": 0.19,
            "width_m": 0.32,
            "depth_m": 0.28,
            "height_m": 0.26,
            "wall_thickness_m": 0.0015,
            "lid_thickness_m": 0.0015,
            "lid_lift_m": 0.22,
            "retrieval": {
              "withdraw_m": 0.5,
              "body_radius_m": 0.4,
              "body_across_m": -0.22,
              "body_start_m": 0.45,
              "body_end_m": 0.9,
              "space_index": 0
            },
            "lid_handle": {
              "span_m": 0.08,
              "depth_m": 0.018,
              "height_m": 0.04,
              "thickness_m": 0.003
            }
          }
        ]
      }
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        16
      ],
      "width_cells": 2,
      "target": "room-h-m5-lower-stairs",
      "target_door": [
        5,
        16
      ]
    },
    {
      "kind": "door",
      "door": [
        5,
        19
      ],
      "width_cells": 2,
      "target": "map-phanthiet-market"
    }
  ],
  "classroom": {
    "teachers": [
      "resident-クリスティアン"
    ],
    "routine_map": "map-phanthiet-in-h-m5",
    "places": [
      {
        "resident": "resident-ハンナ",
        "chair": "a",
        "table": "A"
      },
      {
        "resident": "resident-フェリックス",
        "chair": "b",
        "table": "A"
      },
      {
        "resident": "resident-フリーダ",
        "chair": "c",
        "table": "B"
      },
      {
        "resident": "resident-イダ",
        "chair": "d",
        "table": "B"
      },
      {
        "resident": "resident-ヨハン",
        "chair": "f",
        "table": "C"
      },
      {
        "resident": "resident-リナ",
        "chair": "g",
        "table": "C"
      },
      {
        "resident": "resident-ラウラ",
        "chair": "h",
        "table": "E"
      },
      {
        "resident": "resident-ベンヤミン",
        "chair": "i",
        "table": "E"
      }
    ],
    "teacher_places": [
      {
        "resident": "resident-クリスティアン",
        "at": [
          2,
          3
        ]
      }
    ]
  },
  "door_leaves": [
    {
      "door": [
        5,
        19
      ],
      "hinge": "end",
      "frame_inset_m": 0.025,
      "thickness_m": 0.04,
      "waits_for": [],
      "owner": "町の寄り合いの共用戸",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "source": "木工所へ製作と修繕を頼み、エーリヒが点検する案",
      "operation": {
        "body_radius_m": 0.4,
        "orbit_radius_m": 1.4,
        "start_deg": 20,
        "end_deg": 70,
        "waits_for": [
          {
            "furniture": "g",
            "space_index": 0,
            "reason": "リナが椅子から立つか座る動きを終え、椅子の後ろが空いてから戸を扱う"
          }
        ]
      },
      "push_operation": {
        "body_radius_m": 0.4,
        "poses": [
          {
            "angle_deg": 0,
            "body_m": [
              0.52,
              -0.5
            ]
          },
          {
            "angle_deg": 20,
            "body_m": [
              0.52,
              -0.3
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
  ],
  "windows": [
    {
      "id": "north",
      "side": "n",
      "offset_m": 3.25,
      "width_m": 1,
      "sill_m": 1.1,
      "height_m": 0.9,
      "frame_m": 0.05,
      "owner": "町の寄り合いの共用品",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "source": "木工所の枠と買取屋が選別する再利用ガラス・留め具を使い、担当者が清掃する案"
    },
    {
      "id": "east",
      "side": "e",
      "offset_m": 5.5,
      "width_m": 1,
      "sill_m": 1.1,
      "height_m": 0.9,
      "frame_m": 0.05,
      "owner": "町の寄り合いの共用品",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "source": "木工所の枠と買取屋が選別する再利用ガラス・留め具を使い、担当者が清掃する案"
    }
  ],
  "lamps": [
    {
      "id": "work-1",
      "position_m": [
        3.25,
        4
      ],
      "bottom_m": 2.05,
      "top_m": 2.23,
      "diameter_m": 0.2,
      "owner": "町の寄り合いの共用品",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "source": "町の鍛冶屋の枠と再利用ガラスを使い、ジーモンの灯り油を補う案",
      "use": "利用中に担当者が灯し、消灯と油・煤の手入れを行う"
    },
    {
      "id": "work-2",
      "position_m": [
        3.25,
        7
      ],
      "bottom_m": 2.05,
      "top_m": 2.23,
      "diameter_m": 0.2,
      "owner": "町の寄り合いの共用品",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "source": "町の鍛冶屋の枠と再利用ガラスを使い、ジーモンの灯り油を補う案",
      "use": "利用中に担当者が灯し、消灯と油・煤の手入れを行う"
    }
  ],
  "details": [
    {
      "name": "寄り合いの議事録",
      "on": "卓",
      "support": "I",
      "rect_m": [
        0.4,
        0.35,
        0.3,
        0.2
      ],
      "owner": "町の寄り合いの共用品",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "source": "既存の寄り合い所の生活描写にある記録・掲示と炉の道具を、使用する面へ定める案"
    },
    {
      "name": "貼り替えかけの掲示",
      "on": "壁",
      "support": "N",
      "rect_m": [
        0.455,
        0.35,
        0.005,
        0.3
      ],
      "wall_mount": {
        "side": "e",
        "bottom_m": 1.2,
        "height_m": 0.4
      },
      "owner": "町の寄り合いの共用品",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "source": "既存の寄り合い所の生活描写にある記録・掲示と炉の道具を、使用する面へ定める案"
    },
    {
      "name": "灰の残った火鉢",
      "on": "炉",
      "support": "H",
      "rect_m": [
        0.2,
        0.6,
        0.3,
        0.3
      ],
      "owner": "町の寄り合いの共用品",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "source": "既存の寄り合い所の生活描写にある記録・掲示と炉の道具を、使用する面へ定める案"
    },
    {
      "name": "脱ぎ捨てた泥除け",
      "on": "戸口",
      "rect_m": [
        0.6,
        9,
        0.4,
        0.3
      ],
      "owner": "エーリヒ",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "source": "既存の生活描写にある戸口の泥除けで、書記が外から戻って外したものとする案"
    }
  ]
}
---
# 町の寄り合い所／1階 集会と読み書き

## 用途と利用

[[building-h-m5]] の平面案に属する。授業の参加者は `world/town/routines.ts` の活動タグを正とし、各人の椅子と卓を割り当てる。授業でないときの席替えと集会の人数は未確定である。教材は先生が準備し、寄り合いの記録は書記が扱う。

## 描画へ渡す前の条件

敷地と道、構造と戸・窓、授業と集会の切替と音、通学と帰宅、給排水と便所・燃料と煙・紙の保管と維持は未照合である。現行の日課の時刻と座標、外形と描画は変更しない。


## 入口の戸と席

道へ向く戸は内側へ開き、外の階段の踊り場へ戸板を振り出さない。後列の左の卓と椅子を壁側へ寄せ、戸の回転と椅子を引く範囲を重ねない。戸は町の共用品としてエーリヒが点検し、木工所へ修繕を頼む案とする。身体の平面の動きは下の操作案へ結ぶ。取っ手と腕・上半身の動き、人の行き違い、枠と壁の納まりは未照合である。


## 戸を扱う身体と作業の順番

リナが椅子から立つか座る動きを終え、椅子の後ろが空いてから戸を扱う。戸板の回転とは別に、開閉する身体の円弧と家具の使用面を照合する。同時使用できる面としては扱わず、入る人は下の操作案で戸を保持したまま閉め始める位置へ移り、椅子の後ろが空くまでその位置で待つ。他の来訪者の待機と行き違い、手と上半身の動きは別に照合する。

## 外から押して入る操作

push_operation は蝶番を原点とし、閉じた板に沿う向きと室内へ向く距離で身体の位置を持つ。上の踊り場から取っ手へ手を掛け、戸を押しながら開口を通って室内へ入る。記録した位置どうしを直線で結ぶ間も、回転する戸板へ身体が入らず、取っ手へ届くことを照合する。戸板の厚みや身体の幅を縮めて通す案にしない。

戸が開いてからは取っ手を保持したまま、室内側の閉め始める位置へ進む。この移動も枠・壁・家具と使用面、床と踊り場へ照合する。リナが椅子から立つ動きと重なる閉める操作は、使用面が空くまで待ってから行う。入る人が待つ位置を階段の段や戸の回転域にしない。

この案は身体を平面の円として扱う。取っ手の高さと握り・腕と上半身、戸の重さと保持の金具、荷物を持つ場合、複数の来訪者の待機と行き違い、立体の照合は残る。

```grid
#############
#P.......HHH#
#P..IIII.HHH#
#P..IIII....#
#P....e.....#
#P.........N#
#..........N#
#.AAA...BBB.#
#.AAA...BBB.#
#.a.b...c.d.#
#K..........#
#...........#
#..........R#
#CCC....EEE.#
#CCC....EEE.#
#f.g....h.i.#
D...........#
D...........#
#...........#
#####DD######
```

## 窓と作業の灯り

窓は北壁に設け、記録棚と煙道、読み書きの板を貫かない。集会室は東壁にも開口を持たせる。窓の位置・幅と腰高・高さはメタデータを使い、室内と外観で別の窓を増やさない。灯りは作業面へ届く位置に吊り、通路の頭上を空ける。窓の開閉と外側の清掃、燃料の保管・補充と火の扱い、実際の利用時間での点灯は引き続き照合する。

## 既存の使いかけの物

`world/town/traces.ts` の議事録・貼り替えかけの掲示・灰の残った火鉢・戸口の泥除けを保持し、支持する卓・掲示板・炉と場所を定める。掲示は壁の板へ縦に留め、泥除けは戸の動く範囲を外す。新しい平面にしたことを理由に、使いかけの物と持ち主を消さない。

## 授業で向く先

授業中の生徒は北側の卓と教える人のいる側へ、椅子の向きを保って座る。教える人は生徒の配置の中心を向く。部屋の中心を全員の視線の代わりに使わない。椅子の使用面は近づいて話せる立ち位置であり、着席した身体の位置は座面側で別に持つ。

## 共用椅子の寸法

共用椅子は半メートルの占有格子の中に収まる座面と四本の脚、南側の背もたれを持ち、北側の卓へ向く。寸法は各家具の seat に持ち、室内倍率は描画へ投影するときだけ掛ける。椅子の使用面と座る身体の位置を混同しない。着席中の腰と靴底・膝を照合し、横から入る動作と他の人の通行は引き続き照合する。

## 卓の高さと膝の空間

卓の天板・脚の寸法と、座面から天板下面まで必要な膝の空間を work_surface に持つ。天板の上面だけで椅子との適合を判断しない。脚は占有範囲の内側へ収め、板厚を含む下面と椅子の座面を照合する。着席中の膝と足の形状を照合し、横から入って座る動作は引き続き照合する。

## 授業中の着席と足の支持

生徒の椅子には、座面の前寄りの着席位置と、脚から前へ延ばす足掛けを持たせる。足掛けの高さは割り当てられた人物の姿勢と靴底に合わせる。足掛けは前の卓の下へ延び、under_table で対応する卓を指定する。卓の脚を内側へ引き、足掛けと支持材に重ねない。板は二本の支持材へ届く幅を持つ。板と二本の支持材は同じ寸法から描き、板の範囲外で支持材だけが卓の脚へ当たる場合も検査する。床を歩く使用面は塞がない。椅子の所有と手入れの担当は座面と足掛けで共通である。授業中は背もたれを南にした椅子の向きで座り、部屋の中心や会話相手へ身体ごと回転させない。会話のため近づく位置は座面の後ろの使用面として保持する。

## 入口戸の上下の納まり

集会所の入口戸は内壁面へ取り付け、完成した床と開口上端から逃がす。具体的な取付位置と隙間は door_leaves に持たせ、寸法の意味は [[town#戸板の取付断面]] に従う。雨仕舞い・木の伸縮・金具の固定強度は未照合である。

## 戸板から突出する部品

入口戸の取っ手と補強材は fittings の寸法を使い、[[town#戸板の取付断面]] に従って開閉を照合する。

## 炉口の向き

炉口は hearth_front の使用面へ向け、壁側を焚き口にしない。天端の石も占有する外形の内側へ納める。火の光は炉口側へ置き、梁・屋根と火気、換気と掃除の区間は別に照合する。

集会室の炉は南へ開き、炉の中央の焚口から奥の煙道へつなぐ。使用位置は焚口の正面に置き、記録棚の側から火へ手を入れる形にしない。断面の読み方と接続は [[town#炉と煙道の断面]] に従う。薪と灰、掃除口と手入れの姿勢、石材と目地・荷重の耐力は未照合である。

エーリヒが炉の南側で手入れする身体位置と道具の寸法案を持つ。手入れの条件は [[town#炉の手入れ]] に従う。道具は専用の開放棚 K へ縦に収め、本や食材とは分ける。棚の内寸と直線の引出し、使用位置まで縦に持つ運搬の平面を照合する。道具の持ち替えの空間手順は `handoff` に持たせる。腕・膝・上体の姿勢と実際の動作、灰を受ける工程・屋外への搬出は未照合である。

棚 K の取り出しは授業と寄り合いが終わり、隣の椅子の使用が空いたときに行う。引出し中に通学者と同時に使用面を使わない。日課と運搬への反映は未完了である。

棚から引き出した後は `carry` の身体位置と向きで道具を縦に保って運び、同じ経路を逆に戻す。卓と椅子の間を通り、演壇の卓の東側から炉の南側へ寄る。経路の読み方と照合は [[town#炉の道具の運搬]] に従う。

`handoff.stage_area` を道具を持ち上げて向きを変える空いた場所とする。棚から縦に運び終えた姿勢から始め、身体を横切らない経由点を通して持ち上げ、上で向きを変え、焚口の手前で高さを合わせて差し込む。各段階の握りの位置は部屋原点からの x・床からの高さ・z で記す。腕の関節の動きはこの空間の照合だけで証明しない。共通の条件は [[town#炉の道具の持ち替え]] に従う。

持ち上げる高さはキャラクターの骨格の寸法に合わせて下げた。平面の手の到達上限は実際の片腕の長さではないため、この段階で腕が届く姿勢を照合済みとはしない。立ち位置・身体の向きと曲げ、肘と手首、腕と周囲の干渉は実際の骨格で続けて照合する。

炉を使う握りは床より高く保ち、刃を斜めに差し込む。奥の左右へは握りも移して刃を奥壁へ平行にし、元の持ち替え手順と傾きを同じ寸法で照合する。[[town#炉へ差し込む道具の傾き]] に従う。エーリヒが身体を寄せた静止姿勢の候補は `work_pose_candidate` に持ち、[[town#身体の到達と作業姿勢]] の条件へ照合する。持ち替えから候補へ移る身体の動きと、手首・指、日課への反映は未照合である。

作業姿勢候補の `stroke_motion` は両靴と右膝を動かさない `fixed_support` とする。[[town#身体の到達と作業姿勢]] に従い、固定長の腕が左右を結ぶ全区間へ届くことと両端の身体の境界を照合する。腕・袖口と道具から炉・壁・家具までの離隔は全区間へ照合する。道具と固定した身体の離隔も全区間へ照合する。上腕と身体自身の干渉と指の関節・握力は未照合であり、`stroke_clearance` は未確認のままとする。実際の動作と日課はまだ追加しない。

現在の作業姿勢候補の `kneeling` は腰を下げ、両方の靴底と右膝の衣服の表面を床へ合わせる。`shoe_contacts` は左右の靴を指定する。脚の長さは保持し、靴の接地と膝の接触だけで荷重と重心の安定を照合済みとは扱わない。接地の条件は [[town#身体の到達と作業姿勢]] に従う。支持の移替えと動作中の姿勢は引き続き未設計である。

作業しない左手は `off_hand` の掌の位置へ置き、用具から離す。膝の支持には使わない。反対の腕も道具からの離隔の検査へ含め、握る右手の接触と分けて扱う。

刃と握る腕・手の全体、柄と上腕の離隔、および柄が手首より掌側へ収まることを全区間へ照合する。握る断面は描画する掌の内部へ収めるが、指と柄の接触面の設計が済んだとは扱わない。

掌の開口は実物の柄の断面から組み立て、[[town#作業姿勢の掌と柄の接触]] に従う。指の関節と握力はこの開口とは別に未設計とする。

前腕・掌・袖口と、衣服を含む固定した身体との離隔は [[town#作業する前腕と身体の離隔]] に従い全区間へ照合する。肩の接続と上腕全体の干渉はこの判定に含めない。

作業姿勢候補は衣服からの離隔に余裕を持たせるため身体を使用面内でわずかに横へ寄せる。握り、足形、道具の寸法と支持の種類は保つ。

灰の受け容器は低い専用棚 R に蓋をした空の鉄の箱として置く。担当はエーリヒとし、授業と寄り合いの間は取り出さない。棚 R の使用面は読み書きの卓 E を使う時間と分ける。容器と戸口までの配置案は [[town#炉の灰の受け容器]] に従う。蓋は箱を棚の外へ引き出してから持ち上げる。閉じた箱を運ぶ高さまで持ち上げる物の直線経路と、運搬経路の頭上の空間も照合する。火室から灰を受ける位置、持上げと蓋を扱う身体と手、荷重、入口の段差と屋外の処理先までの搬出は未設計である。

灰箱の蓋は [[town#灰箱の蓋の持ち手]] に従う。収納物の高さは持ち手までを含み、箱本体の容量を増やさない。蓋を持つ手の動きと荷重は未照合である。

箱を引き出して床へ下ろした後の蓋は、専用棚 R の上面の北西寄りへ置く。[[town#灰箱の蓋の置き場所]] に従い、卓 E や通路へ置かない。箱を運び出す前に同じ場所で蓋を戻す。床上で閉じた状態の部材をそのまま運ぶ高さまで持ち上げ、棚から引き出した高さへ瞬間的に移さない。身体の移動と手の操作、荷重と実際の日課は未照合である。

灰を受ける箱は `receiving` の炉の東寄りの床へ置く案とする。箱の縁は炉床より高いため、炉からそのまま掻き落とす受け方にはしない。掻き集めた冷えた灰を道具で持ち上げ、箱の縁を越えて移す方法を検討する。位置と空の箱の外形を照合しても、道具の保持・持上げ・傾けと灰の移載、箱をこの位置へ運んで戻す工程を完了とはしない。

空の受け箱は `receiving.approach` の身体位置を順にたどり、卓の西を回って炉の手前へ運ぶ。箱の向きは変えず、棚の前で蓋を外した箱を持ち上げ、最後の位置で床へ下ろす。蓋は専用棚へ置いたままとする。ここは受け位置そのものではなく、持ち替えと身体の移動を設計するための手前の位置である。そこから受け位置へ置く身体と手、灰を入れた箱の帰りの運搬は未照合とする。

`receiving.grip_candidate` は、棚の前で下ろした箱へ近づいて両手を縁へ届かせる立位の候補である。両手の目標は箱の実寸と掌の半径から手前の角の外側へ取り、腕を伸ばさない。肘は身体の外側へ曲げ、上腕・前腕と袖口の囲いを箱の部材から離す。従来の `approach` の開始位置では両腕が届かないため、この候補へ身体を移す工程と、候補を使う運搬の経路は未照合である。掌の目標が届くことは、指・手首・箱と身体の接触、持上げや歩行、荷重の証明ではない。

## 灰箱を持つ立位と室内の照合

箱の縁へ両手を届かせる候補は、頭・靴と両腕を含む実際の描画部材の保守的な囲いで、床と天井、壁と開いた戸、家具、灯りと小物、置いた蓋へ照合する。卓は同じ寸法で描画する天板と脚を使い、卓そのものを消さない。灰箱を置く面と運搬のための床の占有は別に残し、卓の下を灰の受け位置にしない。固定した立位が空くことを、床の箱を掴む姿勢と立上り・運搬の完成とは扱わない。条件は [[town#灰箱を持つ候補と室内の立体]] に従う。

## 両手の候補から炉の手前までの空間

`receiving.transport_candidate.body_path_m` に、握りの立位から卓の間を通り、炉の手前の身体の待機位置へ至る案を持つ。箱と全身の相対位置、向きと箱の高さを保ち、身体の描画の囲いと箱の全区間を別々に照合する。引出し直後の離れた立ち位置へ、握った身体を戻す代用はしない。置いた蓋と家具を残し、途中だけの接触も拒否する。

この案は固定した姿勢を平行移動する空間の照合であり、実際の足運び・持上げ・荷重を持つ運搬動作ではない。床の箱から握りの候補への移行、最終の受け位置へ下ろす動作、灰を入れた後の運搬は未確認のままとする。詳しい条件は [[town#灰箱と身体を同時に移動する空間の案]] に従う。

## 運搬姿勢の各段階の照合

箱を持つ位置と高さは、立位だけでなく既存の運搬の各描画姿勢でも、頭と脚、箱と両腕の離隔を保つ案へ改める。`transport_candidate.gait_review` は全描画姿勢を参照し、同じ箱と候補の室内経路へ照合する。腕の長さ、身体と箱の寸法、家具は変えない。姿勢間の動きと移動方向、接地と歩幅、重心・荷重と持上げは未確認であり、実際の運搬への採用はしていない。条件は [[town#運搬の各描画姿勢と箱の離隔]] に従う。

## 区間ごとの足運び

固定した向きで通す経路の各区間は `gait_review.step_plan` に対応させる。後退と横移動を前進の動作で代用しない。元の運搬の各姿勢を空間へ照合することと、各区間を実際に歩く動作の割当は別である。未割当の動作は null を保持し、方向が切り替わる位置の接地と身体の移行を含めて設計する。条件は [[town#運搬の経路と足運びの向き]] に従う。

## 後退の候補

経路の最初の後退区間は、既存の運搬の描画姿勢を逆順にたどる候補とする。`step_plan` に同じ `carry` と reverse を割り当て、脚の形と腕の長さ、箱を変えずに全姿勢の保持と室内の離隔を確認する。横移動の区間へこの候補を流用しない。立位からの移行、接地と移動速度、支持する足の切替、横移動への移行は未照合である。条件は [[town#後退の描画姿勢の順序]] に従う。

## 横移動の候補

`gait_review.side_step` に、進行側の足を先に出してから反対の足を寄せる候補の寸法を持つ。腰を少し落として両足を床へ揃え、床に残す足の目標を身体の移動に追従させない。元の大腿と下腿、靴の向きと箱の寸法は維持し、届かない足の目標を脚の伸長で補わない。両手で同じ箱を保持し、標本姿勢で室内へ照合する。

単独の平らな床の周期の目標を、経路全体の接地や、前後の動作への移行の証明とは扱わない。方向の切替、標本間の身体と室内の立体、重心と荷重、歩幅と実際の速度は未確認である。条件は [[town#箱を持った横移動の足の目標]] に従う。

## 横移動の終点で足を揃える

横移動の区間は設計した歩幅を上限に、完結した周期へ距離を均等に配分する。最後の一歩だけを途中で止めず、身体が元の経路の終点に着いたとき両足を揃える。実際の歩幅で箱と身体の姿勢を室内へ照合し、最大の歩幅だけの検査で代用しない。時間と加減速、前進や立位への切替は別に照合する。条件は [[town#横移動の区間と一歩の配分]] に従う。

## 横移動の時間

`side_step.timing` に、一周期の最小時間と身体の速度・加速度の上限を持つ。区間の両端で速度と加速度をゼロにし、身体の移動と足の位相を同じ時刻へ対応させる。減速しても接地した靴を滑らせず、到着後は元の終点で両足を揃える。足の持上げと関節、重心・荷重、別の動作へ切り替える姿勢と標本間の立体は未照合である。条件は [[town#横移動の時間と加減速の候補]] に従う。
