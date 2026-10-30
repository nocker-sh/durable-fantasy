---
{
  "id": "room-woodworker-1",
  "kind": "rooms",
  "title": "ゴットフリートの木工所／1階 工房",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-woodworker",
  "floor": 0,
  "room_name": "工房",
  "use": "作業",
  "occupants": [
    "ゴットフリート",
    "アントン",
    "ニクラス"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "################",
      "#SS.......TT.OO#",
      "#SS..........OO#",
      "#SS............#",
      "#SS..BBBB......#",
      "#SS..BBBB......#",
      "#SS.......AAA..#",
      "#SS.......AAA..#",
      "#SS..FF...AAA..#",
      "#SS..FF........#",
      "#SS..FF........#",
      "#SS..LLLL......#",
      "#SS..LLLL......#",
      "#..............#",
      "#.....EE.......#",
      "##########DDDD##"
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
        10,
        15
      ],
      "width_cells": 4
    },
    {
      "kind": "stair",
      "target": "room-woodworker-stairs",
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
      "name": "家族の上階へ上がる直階段",
      "owner": "woodworker",
      "source": "木工所で組む木製の家具",
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
          "activity": "階段の下端へ出入りする",
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
      "symbol": "B",
      "name": "ゴットフリートの木工台",
      "owner": "ゴットフリート",
      "source": "木工所で組む木製の家具",
      "rect": [
        5,
        4,
        4,
        2
      ],
      "access": [
        [
          6,
          3
        ],
        [
          6,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "台の奥側で部品を確かめる",
          "rect": [
            5,
            2,
            4,
            2
          ]
        },
        {
          "activity": "台の手前で木を削る",
          "rect": [
            5,
            6,
            3,
            2
          ]
        }
      ]
    },
    {
      "symbol": "A",
      "name": "アントンが樽を組む台",
      "owner": "アントン",
      "source": "木工所で組む木製の家具",
      "rect": [
        10,
        6,
        3,
        3
      ],
      "access": [
        [
          9,
          7
        ],
        [
          13,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "樽の部材を合わせる",
          "rect": [
            8,
            6,
            2,
            3
          ]
        },
        {
          "activity": "反対側から樽の部材を確かめる",
          "rect": [
            13,
            6,
            2,
            3
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "鉋と鋸の掛け台",
      "owner": "woodworker",
      "source": "木工所で組む木製の家具",
      "rect": [
        10,
        1,
        2,
        1
      ],
      "access": [
        [
          10,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "刃を覆った道具を出し入れする",
          "rect": [
            9,
            2,
            3,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "L",
      "name": "短い板と部材の置き場",
      "owner": "woodworker",
      "source": "ヨーゼフから受け取って屋外で荒取りする木材",
      "rect": [
        5,
        11,
        4,
        2
      ],
      "access": [
        [
          9,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "室内で使う部材を出し入れする",
          "rect": [
            9,
            10,
            2,
            3
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "F",
      "name": "完成した弓と木工品の棚",
      "owner": "ゴットフリート",
      "source": "木工所で組む木製の家具",
      "rect": [
        5,
        8,
        2,
        3
      ],
      "access": [
        [
          7,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "完成品を並べて持ち出す",
          "rect": [
            7,
            8,
            2,
            3
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "O",
      "name": "扉を閉じて使う暖房炉",
      "owner": "woodworker",
      "source": "石工の炉と鍛冶屋の金物",
      "rect": [
        13,
        1,
        2,
        2
      ],
      "access": [
        [
          12,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "火と燃料を扱う",
          "rect": [
            11,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "E",
      "name": "仕事着と靴を下ろす受け",
      "owner": "woodworker",
      "source": "木工所で組む木製の家具",
      "rect": [
        6,
        14,
        2,
        1
      ],
      "access": [
        [
          5,
          14
        ]
      ],
      "use_space": [
        {
          "activity": "居住部へ上がる前に仕事着を下ろす",
          "rect": [
            4,
            13,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "両開き戸の保持金具と立体の姿勢、長材の搬入・旋回・屋外の原木置場は未設計",
    "刃・木屑と暖房炉・換気と火や灰の搬出経路は未照合",
    "作業中の道具と部材・三人の移動と受渡しは未照合",
    "階段と居住部の木屑・音と埃の遮断・夜の灯りは未照合"
  ],
  "design_dependencies": [
    "building-woodworker",
    "room-woodworker-stairs",
    "map-phanthiet-craft",
    "resident-ゴットフリート",
    "resident-アントン",
    "resident-ニクラス",
    "resident-ヨーゼフ"
  ],
  "origin": [
    0,
    0
  ],
  "parallel_use": [
    {
      "activity": "木を削る仕事と樽の部材合わせ",
      "operations": [
        {
          "resident": "ゴットフリート",
          "furniture": "B",
          "space_index": 1
        },
        {
          "resident": "アントン",
          "furniture": "A",
          "space_index": 0
        }
      ]
    }
  ],
  "door_leaves": [
    {
      "door": [
        10,
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
          "waits_for": [
            {
              "furniture": "L",
              "space_index": 0,
              "reason": "短い板を置場へ戻して使用面を空けてから二枚の戸を順に開ける。板を持つ人を回転の途中へ入れない"
            }
          ]
        },
        "end": {
          "body_radius_m": 0.4,
          "orbit_radius_m": 1.4,
          "start_deg": 20,
          "end_deg": 70,
          "waits_for": [
            {
              "furniture": "L",
              "space_index": 0,
              "reason": "短い板を置場へ戻して使用面を空けてから二枚の戸を順に開ける。板を持つ人を回転の途中へ入れない"
            }
          ]
        },
        "transfer_points_m": [
          [
            5.528828200655936,
            6.184430330899728
          ],
          [
            5.634430330899729,
            7.021171799344064
          ]
        ]
      },
      "meeting_gap_m": 0.01
    }
  ],
  "cargo_routes": [
    {
      "activity": "戸を開けて室内へ入った後、短材を東寄りの一時荷受け床へ運ぶ",
      "length_m": 1.4,
      "width_m": 0.8,
      "clearance_m": 0.1,
      "points_m": [
        [
          6,
          6.6
        ],
        [
          6,
          5.4
        ]
      ]
    }
  ]
}
---

# ゴットフリートの木工所／1階 工房

## 作り手と仕事の区別

[[resident-ゴットフリート]]の木工台、[[resident-アントン]]の樽を組む場所、[[resident-ニクラス]]が部材を運ぶ経路を持つ。ニクラスは働きに来る人であり、この家の常用寝台へ割り当てない。原木は[[resident-ヨーゼフ]]から受け取る。長い原木の荒取りと保管を室内の通路だけで成立させず、屋外の仕事場を別に設計する。

## 材料と完成品

短い板と部材、刃を覆った鉋・鋸、完成した弓と木工品を別の場所に置く。修理する物は持ち主を確認してから扱い、完成品の在庫と預かり品を同じ棚の中身として無条件に数えない。台の占有と作業する床を分け、木を削る作業と樽の部材合わせの静止した組合せを記録する。

## 木屑と居住部

暖房は扉を閉じて使う炉を東北に置く案とし、開いた火口の脇で木屑を積まない。掃き取る木屑と灰、火と材料の離隔、燃料の保管と換気はまだ設計が残る。家族は仕事着と靴を下ろして西の直階段から[[room-woodworker-stairs]]へ上がり、上の戸で調理と就寝の床を工房から分ける。

## 平面案

一セルは半メートル。南の幅広い戸口は材料と完成品の出入りに使う案であり、左右の枠と二枚の内開き板の回転範囲を平面で検査する。両方を開けた有効幅は枠と二枚の板厚を差し引く。西側の板を先に開き、その板を保持して東側の取っ手へ移る平面案を持つ。逆順に閉める。二枚の角には合わせ目の逃げを取る。完成品棚は戸と身体を動かす場所から西へ移し、西の階段へ通れる幅を維持する。保持金具と雨風の止め、立体の姿勢、荷を持つ動作と長材の旋回は未設計である。


身体だけが通れる検査で、長い板や完成した家具を運べるとは判定しない。木を持った旋回、三人の受渡しと日課、屋外の置き場を照合してから描画へ進む。

## 短材を運ぶ床

戸の内側で荷と運ぶ人を含む外形を揃えてから、東寄りの一時荷受け床までまっすぐ運ぶ案を cargo_routes に持つ。ここは荷を置いたままの倉庫にせず、その搬送中に他の人や荷を入れない。これは短材の室内の区間だけの案であり、屋外から戸を越える動作、収納までの持ち替え、長材や完成家具を運べることは示さない。開き切った戸の板厚も障害物として照合する。

## 戸を扱う身体と作業の順番

短い板を置場へ戻して使用面を空けてから二枚の戸を順に開ける。板を持つ人を回転の途中へ入れない。戸板の回転とは別に、開閉する身体の円弧と家具の使用面を照合する。同時使用できる面としては扱わず、待つ人の位置と道側からの操作・人の移動の連続は別に照合する。

```grid
################
#SS.......TT.OO#
#SS..........OO#
#SS............#
#SS..BBBB......#
#SS..BBBB......#
#SS.......AAA..#
#SS.......AAA..#
#SS..FF...AAA..#
#SS..FF........#
#SS..FF........#
#SS..LLLL......#
#SS..LLLL......#
#..............#
#.....EE.......#
##########DDDD##
```
