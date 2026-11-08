---
{
  "id": "room-woodworker-2",
  "kind": "rooms",
  "title": "ゴットフリートの木工所／1階 工房",
  "status": "設計中",
  "source": "apps/main/world/town/houses.ts",
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
      "##########",
      "#SSTT..OO#",
      "#SS....OO#",
      "#SS......D",
      "#SS......D",
      "#SS..BBBB#",
      "#SS..BBBB#",
      "#SS......#",
      "#SS......#",
      "#SS....AA#",
      "#SS....AA#",
      "#SS....AA#",
      "#SS......#",
      "#....LLLL#",
      "#EE..LLLL#",
      "##########"
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
      "target": "room-woodworker-1",
      "door": [
        9,
        3
      ],
      "width_cells": 2,
      "target_door": [
        0,
        3
      ]
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
        5,
        4,
        2
      ],
      "access": [
        [
          6,
          4
        ],
        [
          6,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "台の奥側で部品を確かめる",
          "rect": [
            5,
            3,
            4,
            2
          ]
        },
        {
          "activity": "台の手前で木を削る",
          "rect": [
            5,
            7,
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
        7,
        9,
        2,
        3
      ],
      "access": [
        [
          6,
          10
        ],
        [
          7,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "樽の部材を合わせる",
          "rect": [
            5,
            9,
            2,
            3
          ]
        },
        {
          "activity": "樽の部材を北側から確かめる",
          "rect": [
            7,
            7,
            2,
            2
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
        3,
        1,
        2,
        1
      ],
      "access": [
        [
          3,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "刃を覆った道具を出し入れする",
          "rect": [
            3,
            2,
            2,
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
      "source": "ヨーゼフから受け取り、屋外で荒取りした短い板を店先から運び入れる",
      "rect": [
        5,
        13,
        4,
        2
      ],
      "access": [
        [
          4,
          13
        ]
      ],
      "use_space": [
        {
          "activity": "室内で使う部材を出し入れする",
          "rect": [
            3,
            13,
            2,
            2
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
        7,
        1,
        2,
        2
      ],
      "access": [
        [
          6,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "火と燃料を扱う",
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
      "symbol": "E",
      "name": "仕事着と靴を下ろす受け",
      "owner": "woodworker",
      "source": "木工所で組む木製の家具",
      "rect": [
        1,
        14,
        2,
        1
      ],
      "access": [
        [
          3,
          14
        ]
      ],
      "use_space": [
        {
          "activity": "居住部へ上がる前に仕事着を下ろす",
          "rect": [
            3,
            13,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "長材の搬入・旋回・屋外の原木置場は未設計",
    "刃・木屑と暖房炉・換気と火や灰の搬出経路は未照合",
    "作業中の道具と部材・三人の移動と受渡しは未照合",
    "階段と居住部の木屑・音と埃の遮断・夜の灯りは未照合",
    "店先との間の戸の板と金具・客の目と音の仕切りは未設計"
  ],
  "design_dependencies": [
    "building-woodworker",
    "room-woodworker-1",
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
  ]
}
---

# ゴットフリートの木工所／1階 工房

## 作り手と仕事の区別

[[resident-ゴットフリート]]の木工台、[[resident-アントン]]の樽を組む場所、[[resident-ニクラス]]が部材を運ぶ経路を持つ。ニクラスは働きに来る人であり、この家の常用寝台へ割り当てない。原木は[[resident-ヨーゼフ]]から受け取る。長い原木の荒取りと保管を室内の通路だけで成立させず、屋外の仕事場を別に設計する。

## 店先との区切り

客は[[room-woodworker-1]]で受け渡しを済ませ、工房へは入らない。工房へは店先の売り台の裏にある戸から入る。短い板は店先の戸から運び入れ、工房の南の置き場へ納める。完成した弓と木工品は店先の棚へ出し、工房には仕掛品と道具だけを置く。

## 材料と道具

短い板と部材、刃を覆った鉋・鋸を別の場所に置く。修理する物は店先の預かり棚で持ち主を確かめてから工房へ運び、完成品の在庫と預かり品を同じ棚の中身として数えない。台の占有と作業する床を分け、木を削る作業と樽の部材合わせの静止した組合せを記録する。

## 木屑と居住部

暖房は扉を閉じて使う炉を東北に置く案とし、開いた火口の脇で木屑を積まない。掃き取る木屑と灰、火と材料の離隔、燃料の保管と換気はまだ設計が残る。家族は階段の下の受けで仕事着と靴を下ろして西の直階段から[[room-woodworker-stairs]]へ上がり、上の戸で調理と就寝の床を工房から分ける。

## 平面案

一セルは半メートル。西に階段とその脇の通り道、北に鉋と鋸の掛け台と暖房炉、東の壁沿いに木工台と樽を組む台、南に短い板の置き場、階段の下に仕事着の受けを置く。東北の戸は店先の売り台の裏へ通じる。身体だけが通れる検査で、長い板や完成した家具を運べるとは判定しない。木を持った旋回、三人の受渡しと日課、屋外の置き場を照合してから描画へ進む。

```grid
##########
#SSTT..OO#
#SS....OO#
#SS......D
#SS......D
#SS..BBBB#
#SS..BBBB#
#SS......#
#SS......#
#SS....AA#
#SS....AA#
#SS....AA#
#SS......#
#....LLLL#
#EE..LLLL#
##########
```
