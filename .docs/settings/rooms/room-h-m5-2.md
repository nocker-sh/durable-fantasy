---
{
  "id": "room-h-m5-2",
  "kind": "rooms",
  "title": "町の寄り合い所／2階 記録室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-m5",
  "floor": 1,
  "origin": [
    5,
    0
  ],
  "room_name": "2階 記録室",
  "use": "共用",
  "occupants": [
    "エーリヒ"
  ],
  "bed_capacity": 0,
  "guest_capacity": 0,
  "issues": [
    "敷地と道・地形・隣家、外観と全階の構造・戸と窓は未照合",
    "授業と寄り合い・記録の時間と音、往復と給排水・便所・燃料と換気、維持費と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-m5",
    "resident-エーリヒ",
    "map-phanthiet-in-h-m5-floor-2"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#AAAA.....H.#",
      "#...........#",
      "#...........#",
      "#.......BBBB#",
      "#...........#",
      "#CCCC.......#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#.....TTTT..#",
      "#.....TTTT..#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#...........#",
      "D...........#",
      "D...........#",
      "#...........#",
      "#############"
    ]
  },
  "furniture": [
    {
      "symbol": "A",
      "name": "受け取った書類の棚",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        1,
        1,
        4,
        1
      ],
      "access": [
        [
          1,
          2
        ]
      ],
      "role": "work_storage",
      "use_space": [
        {
          "activity": "受け取った書類の棚を使う",
          "rect": [
            1,
            2,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "shelf",
      "runtime_solid": true,
      "shelf": {
        "height_m": 1.1,
        "board_thickness_m": 0.035,
        "board_tops_m": [
          0.1,
          0.4,
          0.75,
          1.1
        ],
        "front": "s",
        "contents": [
          {
            "id": "A-papers-1",
            "name": "寄り合いで受け取った覚え書き",
            "owner": "町の寄り合いの共用品",
            "source": "エーリヒが町の寄り合いで受け取り、照合するまで保管する書類の束。紙の供給と保存期間は未照合",
            "kind": "papers",
            "board": 0,
            "across_m": -0.5,
            "from_back_m": 0.08,
            "width_m": 0.3,
            "height_m": 0.06,
            "depth_m": 0.3
          },
          {
            "id": "A-papers-2",
            "name": "覚え書きに添えた紙",
            "owner": "町の寄り合いの共用品",
            "source": "エーリヒが受け取った覚え書きと一緒に照合するために分けた書類の束。紙の供給と保存期間は未照合",
            "kind": "papers",
            "board": 1,
            "across_m": 0.0,
            "from_back_m": 0.08,
            "width_m": 0.3,
            "height_m": 0.06,
            "depth_m": 0.3
          },
          {
            "id": "A-papers-3",
            "name": "受け取った時の控え",
            "owner": "町の寄り合いの共用品",
            "source": "エーリヒが書類を受け取った時に書き留めた書類の束。紙の供給と保存期間は未照合",
            "kind": "papers",
            "board": 2,
            "across_m": 0.5,
            "from_back_m": 0.08,
            "width_m": 0.3,
            "height_m": 0.06,
            "depth_m": 0.3
          }
        ]
      }
    },
    {
      "symbol": "B",
      "name": "写し終えた記録の棚",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        8,
        4,
        4,
        1
      ],
      "access": [
        [
          8,
          5
        ]
      ],
      "role": "work_storage",
      "use_space": [
        {
          "activity": "写し終えた記録の棚を使う",
          "rect": [
            8,
            5,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "shelf",
      "runtime_solid": true,
      "shelf": {
        "height_m": 1.1,
        "board_thickness_m": 0.035,
        "board_tops_m": [
          0.1,
          0.4,
          0.75,
          1.1
        ],
        "front": "s",
        "contents": [
          {
            "id": "B-papers-1",
            "name": "書き写した寄り合いの記録",
            "owner": "町の寄り合いの共用品",
            "source": "エーリヒが内容を照合して書き写した書類の束。紙の供給と保存期間は未照合",
            "kind": "papers",
            "board": 0,
            "across_m": -0.5,
            "from_back_m": 0.08,
            "width_m": 0.3,
            "height_m": 0.06,
            "depth_m": 0.3
          },
          {
            "id": "B-papers-2",
            "name": "記録に添えた紙",
            "owner": "町の寄り合いの共用品",
            "source": "エーリヒが照合の際に参照し、記録と一緒に保管するために分けた書類の束。紙の供給と保存期間は未照合",
            "kind": "papers",
            "board": 1,
            "across_m": 0.0,
            "from_back_m": 0.08,
            "width_m": 0.3,
            "height_m": 0.06,
            "depth_m": 0.3
          },
          {
            "id": "B-papers-3",
            "name": "保管する控え",
            "owner": "町の寄り合いの共用品",
            "source": "エーリヒが保管用へ回した写し書類の束。紙の供給と保存期間は未照合",
            "kind": "papers",
            "board": 2,
            "across_m": 0.5,
            "from_back_m": 0.08,
            "width_m": 0.3,
            "height_m": 0.06,
            "depth_m": 0.3
          }
        ]
      }
    },
    {
      "symbol": "C",
      "name": "未整理の記録の受け",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        1,
        6,
        4,
        1
      ],
      "access": [
        [
          1,
          7
        ]
      ],
      "role": "work_storage",
      "use_space": [
        {
          "activity": "未整理の記録の受けを使う",
          "rect": [
            1,
            7,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "shelf",
      "runtime_solid": true,
      "shelf": {
        "height_m": 0.7,
        "board_thickness_m": 0.035,
        "board_tops_m": [
          0.1,
          0.4,
          0.7
        ],
        "front": "s",
        "contents": [
          {
            "id": "C-papers-1",
            "name": "分類前の覚え書き",
            "owner": "町の寄り合いの共用品",
            "source": "エーリヒが受け取った後、仕分けが済むまで置く書類の束。紙の供給と保存期間は未照合",
            "kind": "papers",
            "board": 0,
            "across_m": -0.5,
            "from_back_m": 0.08,
            "width_m": 0.3,
            "height_m": 0.06,
            "depth_m": 0.3
          },
          {
            "id": "C-papers-2",
            "name": "読み直しが必要な紙",
            "owner": "町の寄り合いの共用品",
            "source": "エーリヒが読み直すため、ほかの記録から分けた書類の束。紙の供給と保存期間は未照合",
            "kind": "papers",
            "board": 1,
            "across_m": 0.0,
            "from_back_m": 0.08,
            "width_m": 0.3,
            "height_m": 0.06,
            "depth_m": 0.3
          }
        ]
      }
    },
    {
      "symbol": "T",
      "name": "書類を広げ照合する卓",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        6,
        10,
        4,
        2
      ],
      "access": [
        [
          6,
          9
        ]
      ],
      "role": "table",
      "use_space": [
        {
          "activity": "書類を広げ照合する卓を使う",
          "rect": [
            6,
            8,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "table",
      "runtime_solid": true,
      "work_surface": {
        "height_m": 0.74,
        "thickness_m": 0.04,
        "leg_width_m": 0.06,
        "leg_inset_m": 0.08,
        "knee_clearance_m": 0.18
      }
    },
    {
      "symbol": "H",
      "name": "集会室の炉から上がる石積みの煙道",
      "owner": "町の寄り合いの共用品",
      "source": "町の石工が炉と続けて施工し、担当者が点検する案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        10,
        1,
        1,
        1
      ],
      "access": [
        [
          10,
          2
        ]
      ],
      "role": "chimney_shaft",
      "use_space": [
        {
          "activity": "煙道の外面と記録からの離隔を点検する",
          "rect": [
            10,
            2,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "chimney-shaft",
      "runtime_solid": true
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
      "target": "room-h-m5-upper-stairs",
      "target_door": [
        5,
        16
      ]
    }
  ],
  "private_for": [
    "resident-エーリヒ"
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
        "resident-エーリヒ"
      ],
      "source": "木工所の枠と買取屋が選別する再利用ガラス・留め具を使い、担当者が清掃する案"
    }
  ],
  "lamps": [
    {
      "id": "work-1",
      "position_m": [
        3.75,
        4.5
      ],
      "bottom_m": 2,
      "top_m": 2.14,
      "diameter_m": 0.2,
      "owner": "町の寄り合いの共用品",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "source": "町の鍛冶屋の枠と再利用ガラスを使い、ジーモンの灯り油を補う案",
      "use": "利用中に担当者が灯し、消灯と油・煤の手入れを行う"
    }
  ],
  "record_places": [
    {
      "resident": "resident-エーリヒ",
      "furniture": "T",
      "access_index": 0
    }
  ]
}
---
# 町の寄り合い所／2階 記録室

## 用途と利用

[[building-h-m5]] の平面案に属する。書記が受け取った書類と未整理の記録、写し終えた記録を分ける。家庭の私物や売買の在庫を共用品へ混ぜない。閲覧と受渡しは集会室で行う案とし、誰でも記録の棚へ入る前提にしない。

## 描画へ渡す前の条件

敷地と道、構造と戸・窓、授業と集会の切替と音、通学と帰宅、給排水と便所・燃料と煙・紙の保管と維持は未照合である。現行の日課の時刻と座標、外形と描画は変更しない。

```grid
#############
#AAAA.....H.#
#...........#
#...........#
#.......BBBB#
#...........#
#CCCC.......#
#...........#
#...........#
#...........#
#.....TTTT..#
#.....TTTT..#
#...........#
#...........#
#...........#
#...........#
D...........#
D...........#
#...........#
#############
```

## 炉から屋根への煙道

[[room-h-m5-1]] の炉の上を石積みの煙道として確保する。写し終えた記録の棚を南へ移し、煙道の占有と保守の面へ書類を置かない。煙道は上階の床と屋根を貫き、室内で途切れさせない。材料の離隔と防火の納まり・掃除口と雨仕舞いの詳細は引き続き照合する。

## 窓と作業の灯り

窓は北壁に設け、記録棚と煙道、読み書きの板を貫かない。集会室は東壁にも開口を持たせる。窓の位置・幅と腰高・高さはメタデータを使い、室内と外観で別の窓を増やさない。灯りは作業面へ届く位置に吊り、通路の頭上を空ける。窓の開閉と外側の清掃、燃料の保管・補充と火の扱い、実際の利用時間での点灯は引き続き照合する。

## 卓の高さと膝の空間

卓の天板・脚の寸法と、座面から天板下面まで必要な膝の空間を work_surface に持つ。天板の上面だけで椅子との適合を判断しない。脚は占有範囲の内側へ収め、板厚を含む下面と椅子の座面を照合する。身体の膝と足の形状、横から入って座る動作は引き続き照合する。

## 記録棚の部材と書類束

受け取った書類と写し終えた記録の棚は南の作業面から使う。未整理の記録の受けは低い棚とし、用途が混ざらないよう別に置く。棚板の上面と厚み、書類束の置く段と寸法は shelf に持つ。書類束はエーリヒが用途別に分けて保管する物として描き、用途にない壺や材料を足さない。束の寸法は描画と保管区画の案であり、サーバー上の書類数を表さない。紙の供給と保存期間、束を持ち上げて出す区間は引き続き照合する。
