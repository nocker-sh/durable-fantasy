---
{
  "id": "room-h10-2",
  "kind": "rooms",
  "title": "修道士の家／2階 屋根裏の寝間",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h10",
  "floor": 1,
  "room_name": "屋根裏の寝間",
  "use": "寝",
  "occupants": [
    "ベネディクト",
    "クレメンス"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "##############",
      "#SS.....CC...#",
      "#SS..AA......#",
      "#SS..AA......#",
      "#SS..AA......#",
      "#SS..AA......#",
      "#SS.......EE.#",
      "#SS..........#",
      "#SS..........#",
      "#SS..........#",
      "#SS.......BB.#",
      "#SS.......BB.#",
      "#SS.......BB.#",
      "#....FFFF.BB.#",
      "#............#",
      "#............#",
      "#..........G.#",
      "##############"
    ]
  },
  "connections": [
    {
      "kind": "stair",
      "target": "room-h10-1",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        3,
        1
      ],
      "target_access": [
        3,
        12
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "地上階とつながる直階段",
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
          1
        ]
      ],
      "use_space": [
        {
          "activity": "地上階とつながる直階段を使う",
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
      "symbol": "A",
      "name": "ベネディクトの個別寝台",
      "owner": "ベネディクト",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        5,
        2,
        2,
        4
      ],
      "access": [
        [
          7,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "ベネディクトの個別寝台を使う",
          "rect": [
            7,
            5,
            2,
            2
          ]
        }
      ],
      "role": "bed",
      "runtime_kind": "bed",
      "runtime_solid": true,
      "bed": {
        "frame_height_m": 0.38,
        "deck_thickness_m": 0.025,
        "rail_width_m": 0.05,
        "rail_height_m": 0.14,
        "leg_width_m": 0.06,
        "head_height_m": 0.8,
        "mattress_thickness_m": 0.12,
        "head_side": "n"
      }
    },
    {
      "symbol": "B",
      "name": "クレメンスの個別寝台",
      "owner": "クレメンス",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        10,
        10,
        2,
        4
      ],
      "access": [
        [
          9,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "クレメンスの個別寝台を使う",
          "rect": [
            8,
            10,
            2,
            2
          ]
        }
      ],
      "role": "bed",
      "runtime_kind": "bed",
      "runtime_solid": true,
      "bed": {
        "frame_height_m": 0.38,
        "deck_thickness_m": 0.025,
        "rail_width_m": 0.05,
        "rail_height_m": 0.14,
        "leg_width_m": 0.06,
        "head_height_m": 0.8,
        "mattress_thickness_m": 0.12,
        "head_side": "n"
      }
    },
    {
      "symbol": "C",
      "name": "ベネディクトの個人収納",
      "owner": "ベネディクト",
      "source": "町の木工所で製作し、二人が修理して使う案",
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
          "activity": "ベネディクトの個人収納を使う",
          "rect": [
            8,
            2,
            2,
            3
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "ベネディクト"
      ],
      "compartments": [
        "本人専用の棚と三つの小箱"
      ],
      "runtime_kind": "shelf",
      "runtime_solid": true,
      "shelf": {
        "height_m": 0.9,
        "board_thickness_m": 0.025,
        "board_tops_m": [
          0.12,
          0.5,
          0.9
        ],
        "front": "s",
        "contents": [
          {
            "id": "C-box-1",
            "name": "ベネディクトの衣服の小箱",
            "owner": "ベネディクト",
            "source": "町の木工所へ製作を頼む、取り外す平蓋の木製小箱の案",
            "kind": "box",
            "board": 0,
            "across_m": -0.22,
            "from_back_m": 0.04,
            "width_m": 0.35,
            "depth_m": 0.35,
            "height_m": 0.25,
            "wall_thickness_m": 0.015,
            "lid_thickness_m": 0.02,
            "retrieval": {
              "withdraw_m": 0.45,
              "body_radius_m": 0.4,
              "body_across_m": -0.1,
              "body_start_m": 0.65,
              "body_end_m": 0.8,
              "space_index": 0
            },
            "lid_lift_m": 0.1
          },
          {
            "id": "C-box-2",
            "name": "ベネディクトの首巻きの小箱",
            "owner": "ベネディクト",
            "source": "町の木工所へ製作を頼む、取り外す平蓋の木製小箱の案",
            "kind": "box",
            "board": 0,
            "across_m": 0.22,
            "from_back_m": 0.04,
            "width_m": 0.35,
            "depth_m": 0.35,
            "height_m": 0.25,
            "wall_thickness_m": 0.015,
            "lid_thickness_m": 0.02,
            "retrieval": {
              "withdraw_m": 0.45,
              "body_radius_m": 0.4,
              "body_across_m": 0.1,
              "body_start_m": 0.65,
              "body_end_m": 0.8,
              "space_index": 0
            },
            "lid_lift_m": 0.1
          },
          {
            "id": "C-box-3",
            "name": "ベネディクトの私物の小箱",
            "owner": "ベネディクト",
            "source": "町の木工所へ製作を頼む、取り外す平蓋の木製小箱の案",
            "kind": "box",
            "board": 1,
            "across_m": 0,
            "from_back_m": 0.04,
            "width_m": 0.35,
            "depth_m": 0.35,
            "height_m": 0.25,
            "wall_thickness_m": 0.015,
            "lid_thickness_m": 0.02,
            "retrieval": {
              "withdraw_m": 0.45,
              "body_radius_m": 0.4,
              "body_across_m": 0,
              "body_start_m": 0.65,
              "body_end_m": 0.8,
              "space_index": 0
            },
            "lid_lift_m": 0.1
          }
        ]
      }
    },
    {
      "symbol": "E",
      "name": "クレメンスの個人収納",
      "owner": "クレメンス",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        10,
        6,
        2,
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
          "activity": "クレメンスの個人収納を使う",
          "rect": [
            10,
            7,
            2,
            3
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "クレメンス"
      ],
      "compartments": [
        "本人専用の棚と三つの小箱"
      ],
      "runtime_kind": "shelf",
      "runtime_solid": true,
      "shelf": {
        "height_m": 0.9,
        "board_thickness_m": 0.025,
        "board_tops_m": [
          0.12,
          0.5,
          0.9
        ],
        "front": "s",
        "contents": [
          {
            "id": "E-box-1",
            "name": "クレメンスの衣服の小箱",
            "owner": "クレメンス",
            "source": "町の木工所へ製作を頼む、取り外す平蓋の木製小箱の案",
            "kind": "box",
            "board": 0,
            "across_m": -0.22,
            "from_back_m": 0.04,
            "width_m": 0.35,
            "depth_m": 0.35,
            "height_m": 0.25,
            "wall_thickness_m": 0.015,
            "lid_thickness_m": 0.02,
            "retrieval": {
              "withdraw_m": 0.45,
              "body_radius_m": 0.4,
              "body_across_m": -0.1,
              "body_start_m": 0.65,
              "body_end_m": 0.8,
              "space_index": 0
            },
            "lid_lift_m": 0.1
          },
          {
            "id": "E-box-2",
            "name": "クレメンスの首巻きの小箱",
            "owner": "クレメンス",
            "source": "町の木工所へ製作を頼む、取り外す平蓋の木製小箱の案",
            "kind": "box",
            "board": 0,
            "across_m": 0.22,
            "from_back_m": 0.04,
            "width_m": 0.35,
            "depth_m": 0.35,
            "height_m": 0.25,
            "wall_thickness_m": 0.015,
            "lid_thickness_m": 0.02,
            "retrieval": {
              "withdraw_m": 0.45,
              "body_radius_m": 0.4,
              "body_across_m": 0.1,
              "body_start_m": 0.65,
              "body_end_m": 0.8,
              "space_index": 0
            },
            "lid_lift_m": 0.1
          },
          {
            "id": "E-box-3",
            "name": "クレメンスの私物の小箱",
            "owner": "クレメンス",
            "source": "町の木工所へ製作を頼む、取り外す平蓋の木製小箱の案",
            "kind": "box",
            "board": 1,
            "across_m": 0,
            "from_back_m": 0.04,
            "width_m": 0.35,
            "depth_m": 0.35,
            "height_m": 0.25,
            "wall_thickness_m": 0.015,
            "lid_thickness_m": 0.02,
            "retrieval": {
              "withdraw_m": 0.45,
              "body_radius_m": 0.4,
              "body_across_m": 0,
              "body_start_m": 0.65,
              "body_end_m": 0.8,
              "space_index": 0
            },
            "lid_lift_m": 0.1
          }
        ]
      }
    },
    {
      "symbol": "F",
      "name": "替えの寝具棚",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "町の木工所で製作し、二人が修理して使う案",
      "rect": [
        5,
        13,
        4,
        1
      ],
      "access": [
        [
          5,
          14
        ],
        [
          8,
          14
        ]
      ],
      "use_space": [
        {
          "activity": "替えの寝具棚を使う",
          "rect": [
            5,
            14,
            4,
            3
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
          0.65,
          1.2
        ],
        "front": "s",
        "contents": [
          {
            "id": "linen-1",
            "name": "ベネディクトの替えの敷布と掛け布",
            "owner": "ベネディクト",
            "source": "二人が洗って乾かして保管する替えの布類の案。寝台の厚い敷き寝具を含めない。素材・入手先・交換は未照合",
            "kind": "linen",
            "board": 0,
            "across_m": -0.5,
            "from_back_m": 0.025,
            "width_m": 0.7,
            "depth_m": 0.4,
            "height_m": 0.2,
            "retrieval": {
              "withdraw_m": 0.5,
              "body_radius_m": 0.4,
              "body_across_m": -0.5,
              "body_start_m": 0.65,
              "body_end_m": 0.9,
              "space_index": 0
            }
          },
          {
            "id": "linen-2",
            "name": "クレメンスの替えの敷布と掛け布",
            "owner": "クレメンス",
            "source": "二人が洗って乾かして保管する替えの布類の案。寝台の厚い敷き寝具を含めない。素材・入手先・交換は未照合",
            "kind": "linen",
            "board": 1,
            "across_m": 0.5,
            "from_back_m": 0.025,
            "width_m": 0.7,
            "depth_m": 0.4,
            "height_m": 0.2,
            "retrieval": {
              "withdraw_m": 0.5,
              "body_radius_m": 0.4,
              "body_across_m": 0.5,
              "body_start_m": 0.65,
              "body_end_m": 0.9,
              "space_index": 0
            }
          }
        ]
      }
    },
    {
      "symbol": "G",
      "name": "家庭の調理炉から上がる石積みの煙道",
      "owner": "ベネディクトとクレメンスの世帯",
      "source": "石工のマルクスが下の炉と一続きに施工し、二人が外面を点検する案",
      "maintainers": [
        "resident-ベネディクト",
        "resident-クレメンス"
      ],
      "rect": [
        11,
        16,
        1,
        1
      ],
      "access": [
        [
          11,
          15
        ]
      ],
      "use_space": [
        {
          "activity": "煙道の外面と寝具からの離隔を点検する",
          "rect": [
            10,
            14,
            2,
            2
          ]
        }
      ],
      "role": "chimney_shaft",
      "runtime_kind": "chimney-shaft",
      "runtime_solid": true
    }
  ],
  "issues": [
    "窓・梁・戸の開閉と操作、火気と換気の立体は未照合",
    "便所・給排水・薪と灰、収納容量・日課と描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h10-2-1",
      "resident": "resident-ベネディクト",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "浅い棚と本人専用の小箱を配置し、内寸と前へ取り出す平面を照合済み。中身の量と蓋を開ける動作は未照合",
      "storage_id": "storage-h10-2-1",
      "storage_symbol": "C"
    },
    {
      "id": "bed-h10-2-2",
      "resident": "resident-クレメンス",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "浅い棚と本人専用の小箱を配置し、内寸と前へ取り出す平面を照合済み。中身の量と蓋を開ける動作は未照合",
      "storage_id": "storage-h10-2-2",
      "storage_symbol": "E"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h10",
    "resident-ベネディクト",
    "resident-クレメンス",
    "resident-マルクス"
  ],
  "personal_storage": [
    {
      "id": "storage-h10-2-1",
      "resident": "resident-ベネディクト",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人専用の棚と三つの小箱"
    },
    {
      "id": "storage-h10-2-2",
      "resident": "resident-クレメンス",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "E",
      "compartment": "本人専用の棚と三つの小箱"
    }
  ],
  "private_for": [
    "resident-ベネディクト",
    "resident-クレメンス"
  ],
  "origin": [
    0,
    0
  ]
}
---
# 修道士の家／2階 屋根裏の寝間

## 二人の個別の寝床

二人に一つずつ寝台と個人収納を置く。寝台を交代で共有せず、書物と仕事の材料を寝具へ積まない。共用階段から各寝台の使用面へ分かれ、互いの寝台を横切らずに衣服を取り出せる。替えの寝具を二人で管理する。

屋根の灰を下ろす経路、寝具の乾燥、夜の用便と防寒は未設計であり、寝床の平面だけで暮らしの完成としない。

## 平面案

一セルは半メートル。階段は両階の同じ占有へ合わせる。

```grid
##############
#SS.....CC...#
#SS..AA......#
#SS..AA......#
#SS..AA......#
#SS..AA......#
#SS.......EE.#
#SS..........#
#SS..........#
#SS..........#
#SS.......BB.#
#SS.......BB.#
#SS.......BB.#
#....FFFF.BB.#
#............#
#............#
#..........G.#
##############
```

## 個別寝台の断面

各寝台は四脚から側枠と床板へ荷重を渡す木製の枠とし、床板の上へ個人の寝具を載せる。枠と脚は家具に記した木工所へ製作と修理を頼み、寝具は各持ち主が手入れする。頭側は北とし、個人収納へ寝具を重ねない。bed に完成床からの高さと部材の厚みを持たせ、枠の外形は家具のグリッドを使う。寝具の有効面は枠の内側に取る。寝返りと乗降、寝具を外して乾かす経路、床の荷重と寝具の材料・入手と交換は引き続き照合する。

## 個人収納と替えの寝具を取り出す場所

個人収納は寝台の頭側から離し、南から使える浅い開放棚にする。本人専用の取り外す平蓋の小箱を衣服・首巻き・私物に分け、棚の上で蓋を開けず、手前へ出してから扱う。ベネディクトの寝台への出入りは足側へ寄せ、収納の使用面と分ける。クレメンスの棚は寝台の北側に取り出す場所を挟んで置く。

替えの寝具棚は南側で幅を広げ、奥行きを浅くする。替えの敷布と掛け布を二人で別の段へ置き、前面に沿って取り出す場所を使う。厚い敷き寝具は棚へ畳まず寝台で使い、干す経路は別に設計する。箱と布類は左右の前縁へ両手を掛け、中央だけでなく両端へ手が届くことを確かめる。retrieval は物を前へ出す距離と、それに合わせて身体が下がる平面の案を表す。小箱の壁と取り外す平蓋の厚みは保管内寸から引く。蓋を外す姿勢、持ち運び、寝具を広げて乾かす経路、衣服と私物の量は引き続き照合する。

## 小箱の底と蓋

小箱は底板と四枚の側板、取り外す平蓋を持つ。底板は側板と同じ厚みとし、蓋は外形を覆う別の板にする。棚から出してから lid_lift_m の高さまで真上に離す。蓋を閉じた外形の内側を一枚の塊として埋めず、保管内寸と同じ空洞を描く。腕の高さと蓋を持ち替える姿勢、蓋を置く場所は未照合である。

## 炉から屋根までの煙道

炉と煙道は [[resident-マルクス]] に依頼する石積みとし、木製家具の製作元とは分ける。地上階の炉を南へ寄せ、上階の寝台の足側から離した位置へ同じ断面の煙道を通す。二人が外面と周囲の置き物を点検し、修繕は石工へ頼む。梁と屋根の貫通、掃除口と灰の搬出、燃焼に使う空気と換気、薪の置き場は引き続き設計する。
