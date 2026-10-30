---
{
  "id": "room-h5-1",
  "kind": "rooms",
  "title": "グレーテとアンナの家／1階 居間兼台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h5",
  "floor": 0,
  "room_name": "居間兼台所",
  "use": "台所",
  "occupants": [
    "グレーテ",
    "アンナ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "############",
      "#SS.KKWOO..#",
      "#SS....OO..#",
      "#SS.......F#",
      "#SS.......F#",
      "#SS..A.....#",
      "#SS..TT..VV#",
      "#SS..TT..VV#",
      "#SS..B.....#",
      "#SS........#",
      "#SS......EE#",
      "#SS......EE#",
      "#SS......LL#",
      "#####DD#####"
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
      "door": [
        5,
        13
      ],
      "width_cells": 2,
      "target": "map-phanthiet"
    },
    {
      "kind": "stair",
      "furniture": "S",
      "target": "room-h5-2",
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
      "name": "二階への直階段",
      "owner": "greengrocer",
      "source": "町の木工師から手に入れた家具",
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
      "symbol": "O",
      "name": "家庭の調理炉",
      "owner": "greengrocer",
      "source": "石工の炉と鍛冶屋の金物",
      "rect": [
        7,
        1,
        2,
        2
      ],
      "access": [
        [
          7,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食事を調理する",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "K",
      "name": "食材を切る台",
      "owner": "greengrocer",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        4,
        1,
        2,
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
          "activity": "食材を下ごしらえする",
          "rect": [
            3,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "蓋付きの飲用水容器",
      "owner": "greengrocer",
      "source": "陶工の水容器と井戸から姉妹が運ぶ水",
      "rect": [
        6,
        1,
        1,
        1
      ],
      "access": [
        [
          6,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "飲用水を取り出す",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "F",
      "name": "家で食べる物の箱",
      "owner": "greengrocer",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        10,
        3,
        1,
        2
      ],
      "access": [
        [
          9,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材を出し入れする",
          "rect": [
            8,
            3,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "V",
      "name": "翌日の売り物の野菜籠",
      "owner": "グレーテ",
      "source": "カールの畑と町の菜園から届く野菜と運搬用の籠",
      "rect": [
        9,
        6,
        2,
        2
      ],
      "access": [
        [
          8,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "野菜を確かめて売り場へ出す",
          "rect": [
            7,
            6,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "T",
      "name": "姉妹の食卓",
      "owner": "greengrocer",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        5,
        6,
        2,
        2
      ],
      "access": [
        [
          7,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "食事を配膳する",
          "rect": [
            7,
            5,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "A",
        "B"
      ]
    },
    {
      "symbol": "A",
      "name": "グレーテの椅子",
      "owner": "グレーテ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        5,
        5,
        1,
        1
      ],
      "access": [
        [
          6,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "食卓へ出入りする",
          "rect": [
            6,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "B",
      "name": "アンナの椅子",
      "owner": "アンナ",
      "source": "町の木工師から手に入れた家具",
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
          "activity": "食卓へ出入りする",
          "rect": [
            6,
            8,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "E",
      "name": "濡れた仕事着と靴の受け",
      "owner": "greengrocer",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        9,
        10,
        2,
        2
      ],
      "access": [
        [
          8,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "帰宅時に仕事着と靴を下ろす",
          "rect": [
            7,
            9,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "L",
      "name": "家族の洗濯籠と受け桶",
      "owner": "greengrocer",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        9,
        12,
        2,
        1
      ],
      "access": [
        [
          8,
          12
        ]
      ],
      "use_space": [
        {
          "activity": "自分たちの洗濯物を扱う",
          "rect": [
            7,
            11,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "売り場と洗濯場への実際の日課・仕入れと納品の移動は未照合",
    "家庭の室内干しの容量・湿気と換気・薪と灰は未確定",
    "戸と枠・金具・手洗いと便所・汚水の搬出先は未確定",
    "椅子・籠・荷を持った姿勢と複数人の同時の移動は未照合"
  ],
  "design_dependencies": [
    "building-h5",
    "facility-square-well",
    "facility-square-washing"
  ],
  "origin": [
    0,
    0
  ],
  "door_leaves": [
    {
      "door": [
        5,
        13
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
            "furniture": "S",
            "space_index": 0,
            "reason": "階段の下端を空けてから戸を扱い、降りてくる人を回転域へ立たせない"
          },
          {
            "furniture": "B",
            "space_index": 0,
            "reason": "アンナが椅子へ出入りする動きが終わり使用面が空いてから戸を扱う"
          }
        ]
      }
    }
  ],
  "overhead": [
    {
      "purpose": "姉妹自身の洗濯物を室内で干す",
      "projected_cells": [
        9,
        12,
        2,
        1
      ],
      "support": "東南の壁の持ち送りと縄",
      "access": [
        8,
        12
      ],
      "minimum_cloth_bottom_m": 1.2,
      "covers_passage": false
    }
  ],
  "parallel_use": [
    {
      "activity": "姉妹の食卓への出入り",
      "operations": [
        {
          "resident": "グレーテ",
          "furniture": "A",
          "space_index": 0
        },
        {
          "resident": "アンナ",
          "furniture": "B",
          "space_index": 0
        }
      ]
    },
    {
      "activity": "調理と野菜の持出しの準備",
      "operations": [
        {
          "resident": "アンナ",
          "furniture": "O",
          "space_index": 0
        },
        {
          "resident": "グレーテ",
          "furniture": "V",
          "space_index": 0
        }
      ]
    }
  ]
}
---

# グレーテとアンナの家／1階 居間兼台所

## 家庭の食事と売り物

[[resident-グレーテ]]と[[resident-アンナ]]の家である。北側に炉・下ごしらえ・飲用水と家で食べる物の箱を置き、中央に二人の食卓を置く。グレーテが持ち出す翌日の野菜は東寄りの籠へ分け、家庭の食材と売り物を同じ在庫として数えない。籠は野菜を確かめて運ぶためのもので、ここを新しい店内売り場にしない。

## 洗濯仕事と汚れ物

アンナの洗濯仕事は[[facility-square-washing]]と対応させる。仕事で預かる汚れ物を食卓・売り物の野菜籠・寝台の収納へ積まない。客の洗濯物の受渡しと運搬・乾燥先は、客の世帯と洗濯場の資料へつないで設計する。家庭の食卓を洗濯仕事の仕分け台にはしない。

南東に自分たちの濡れた仕事着と靴を下ろす受け、家族用の洗濯籠と受け桶を置く。家族の洗濯物を干す縄は受け桶の上に限定し、入口や階段へ渡さない。職業の洗濯物がすべてこの室内干しに収まるとは判定しない。容量と湿気、汚れと食品の離隔は引き続き照合する。

## 階段と入口

西側の直階段で[[room-h5-2]]へ上がる。南の入口は階段の使用面から離し、戸の板厚と枠、動かす本人の身体と取っ手への距離を持つ開閉案とする。屋外では建物を半回転し、入口を北の通り側へ向ける。

## 平面案

一セルは半メートルである。家具の占有と使用面を別に置き、料理と野菜の持出し、二人の食卓の出入りの組合せを記録する。


飲用水は[[facility-square-well]]から姉妹が運ぶ案とする。手洗い、便所、薪と灰、汚水と残り物の搬出先は未確定であり、日課・立体・描画との照合を終えるまで設計を通過させない。

## 戸を扱う身体と作業の順番

階段の下端を空けてから戸を扱い、降りてくる人を回転域へ立たせない。アンナが椅子へ出入りする動きが終わり使用面が空いてから戸を扱う。戸板の回転とは別に、開閉する身体の円弧と家具の使用面を照合する。同時使用できる面としては扱わず、待つ人の位置と道側からの操作・人の移動の連続は別に照合する。

```grid
############
#SS.KKWOO..#
#SS....OO..#
#SS.......F#
#SS.......F#
#SS..A.....#
#SS..TT..VV#
#SS..TT..VV#
#SS..B.....#
#SS........#
#SS......EE#
#SS......EE#
#SS......LL#
#####DD#####
```
