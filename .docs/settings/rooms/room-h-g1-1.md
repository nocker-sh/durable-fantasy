---
{
  "id": "room-h-g1-1",
  "kind": "rooms",
  "title": "テオの家／1階 居間兼台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g1",
  "floor": 0,
  "room_name": "居間兼台所",
  "use": "台所",
  "occupants": [
    "テオ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####DD#####",
      "#OOKK..W.MM#",
      "#OO........#",
      "#..EE......#",
      "#......TT..#",
      "#......TT.F#",
      "D......C..F#",
      "D..........#",
      "############"
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
      "target": "room-h-g1-2",
      "door": [
        5,
        0
      ],
      "target_door": [
        5,
        6
      ],
      "width_cells": 2
    },
    {
      "kind": "door",
      "target": "map-phanthiet-gate",
      "door": [
        0,
        6
      ],
      "width_cells": 2
    }
  ],
  "furniture": [
    {
      "symbol": "O",
      "name": "家庭の調理と暖房の炉",
      "owner": "テオ",
      "source": "石工の炉と鍛冶屋の金物",
      "rect": [
        1,
        1,
        2,
        2
      ],
      "access": [
        [
          2,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食事を調理する",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "K",
      "name": "下ごしらえ台",
      "owner": "テオ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        3,
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
          "activity": "食材を切る",
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
      "symbol": "W",
      "name": "飲用水の蓋付き容器",
      "owner": "テオ",
      "source": "陶工の容器と門の井戸から本人が運ぶ水",
      "rect": [
        7,
        1,
        1,
        1
      ],
      "access": [
        [
          7,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "飲用水を取り出す",
          "rect": [
            6,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "M",
      "name": "町の絵地図の額と台",
      "owner": "テオ",
      "source": "フェルディナントから受け取る町の地図と木の額",
      "rect": [
        9,
        1,
        2,
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
          "activity": "道順を確かめる",
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
      "symbol": "T",
      "name": "一人の食卓",
      "owner": "テオ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        7,
        4,
        2,
        2
      ],
      "access": [
        [
          6,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "食卓へ配膳する",
          "rect": [
            5,
            3,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "C"
      ]
    },
    {
      "symbol": "C",
      "name": "食卓の椅子",
      "owner": "テオ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        7,
        6,
        1,
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
          "activity": "食卓の席へ出入りする",
          "rect": [
            5,
            5,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "F",
      "name": "蓋付きの食材箱",
      "owner": "テオ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        10,
        5,
        1,
        2
      ],
      "access": [
        [
          10,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "食材を出し入れする",
          "rect": [
            9,
            3,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "E",
      "name": "濡れた靴と外套の受け",
      "owner": "テオ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        3,
        3,
        2,
        1
      ],
      "access": [
        [
          3,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "帰宅時に靴と外套を下ろす",
          "rect": [
            3,
            4,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "濡れ物の乾燥・炉と窓・煙突と紙の離隔は未照合",
    "便所・灰・薪と汚水の搬出先・換気と収納容量は未確定",
    "取っ手と金具・姿勢と荷物・開いた戸の脇の通行は未照合",
    "案内の準備と外の仕事・水汲み・食事の日課の照合未完了"
  ],
  "design_dependencies": [
    "building-h-g1",
    "room-h-g1-2",
    "map-phanthiet-gate",
    "facility-gate-well"
  ],
  "origin": [
    0,
    6
  ],
  "door_leaves": [
    {
      "door": [
        0,
        6
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
            "furniture": "O",
            "space_index": 0,
            "reason": "テオは調理の手を止め、鍋と火を落ち着かせてから戸を扱う。調理と開閉を同時の仕事として数えない"
          },
          {
            "furniture": "E",
            "space_index": 0,
            "reason": "テオは靴と外套を下ろして使用面を空け、別の仕事として戸を扱う"
          }
        ]
      }
    }
  ]
}
---

# テオの家／1階 居間兼台所

## 道案内の準備と家庭の食事

[[resident-テオ]]が町の絵地図で道順を確かめ、食事と帰宅の支度を行う一室である。地図は[[resident-フェルディナント]]との仕事のつながりから受け取る。道案内と荷の取り次ぎを、旅人の荷を自宅の食卓や寝台へ積み上げる倉庫の仕事に変えない。

絵地図の面と食卓を分け、食材を切ったり洗い物をしたりする面へ紙を広げない。北側の炉・下ごしらえ・飲用水と、東の蓋付きの食材箱から食事を用意する。案内の覚書や乾いた道具は寝室の専用の箱へしまい、濡れた外套と混ぜない。

## 帰宅と寝室への通路

西の戸から入り、濡れた靴と外套を入口の受けへ下ろす。食卓の椅子をまたがず、北の戸で[[room-h-g1-2]]へ入る。本人の寝床へ荷の受渡しを通す構成にせず、戸と枠・操作する身体の平面を別に記録する。

## 平面案

一セルは半メートルである。


飲用水は[[facility-gate-well]]から本人が運ぶ案とする。紙と火、濡れ物の乾燥、便所と灰・汚水の搬出、荷物を持つ姿勢と日課の移動は引き続き照合する。

## 戸を扱う身体と作業の順番

テオは調理の手を止め、鍋と火を落ち着かせてから戸を扱う。調理と開閉を同時の仕事として数えない。テオは靴と外套を下ろして使用面を空け、別の仕事として戸を扱う。戸板の回転とは別に、開閉する身体の円弧と家具の使用面を照合する。同時使用できる面としては扱わず、待つ人の位置と道側からの操作・人の移動の連続は別に照合する。

```grid
#####DD#####
#OOKK..W.MM#
#OO........#
#..EE......#
#......TT..#
#......TT.F#
D......C..F#
D..........#
############
```
