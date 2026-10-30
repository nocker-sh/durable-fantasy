---
{
  "id": "room-coop-1",
  "kind": "rooms",
  "title": "鶏小屋／1階 鶏小屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-coop",
  "floor": 0,
  "room_name": "1階 鶏小屋",
  "use": "鶏の世話",
  "occupants": [
    "カール",
    "ウルリケ",
    "フリッツ",
    "ミア",
    "ゲルトルート",
    "ヴァルター"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "##############",
      "#RRRRRRR..NNN#",
      "#RRRRRRR..NNN#",
      "#.........NNN#",
      "D............#",
      "D............#",
      "#............#",
      "#FFF......WWW#",
      "#FFF......WWW#",
      "#............D",
      "#.....EE.....D",
      "#BBB..EE..QQQ#",
      "#BBB......QQQ#",
      "##############"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        4
      ],
      "width_cells": 2,
      "target": "map-phanthiet"
    },
    {
      "kind": "door",
      "door": [
        13,
        9
      ],
      "width_cells": 2,
      "target": "map-phanthiet"
    }
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "止まり木と下の敷料の範囲",
      "owner": "農家のカールとウルリケの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ウルリケが手入れする案",
      "rect": [
        1,
        1,
        7,
        2
      ],
      "access": [
        [
          1,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "止まり木と下の敷料の範囲を使う",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ],
      "role": "animal_roost",
      "maintainers": [
        "resident-ウルリケ"
      ]
    },
    {
      "symbol": "N",
      "name": "産卵用の巣箱",
      "owner": "農家のカールとウルリケの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ウルリケが手入れする案",
      "rect": [
        10,
        1,
        3,
        3
      ],
      "access": [
        [
          9,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "産卵用の巣箱を使う",
          "rect": [
            8,
            1,
            2,
            2
          ]
        }
      ],
      "role": "animal_nest",
      "maintainers": [
        "resident-ウルリケ"
      ]
    },
    {
      "symbol": "F",
      "name": "餌の受け",
      "owner": "農家のカールとウルリケの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ウルリケが手入れする案",
      "rect": [
        1,
        7,
        3,
        2
      ],
      "access": [
        [
          4,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "餌の受けを使う",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ],
      "role": "animal_feed",
      "maintainers": [
        "resident-ウルリケ"
      ]
    },
    {
      "symbol": "W",
      "name": "鶏の飲み水の受け",
      "owner": "農家のカールとウルリケの世帯",
      "source": "町の木工所と鍛冶場へ台と水受けの製作を頼む案。水漏れと耐水性は未照合。ウルリケが手入れする案",
      "rect": [
        10,
        7,
        3,
        2
      ],
      "access": [
        [
          9,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "鶏の飲み水の受けを使う",
          "rect": [
            8,
            7,
            2,
            2
          ]
        }
      ],
      "role": "animal_water",
      "maintainers": [
        "resident-ウルリケ"
      ]
    },
    {
      "symbol": "B",
      "name": "乾いた敷料の蓋付き箱",
      "owner": "農家のカールとウルリケの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ウルリケが手入れする案",
      "rect": [
        1,
        11,
        3,
        2
      ],
      "access": [
        [
          4,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "乾いた敷料の蓋付き箱を使う",
          "rect": [
            4,
            11,
            2,
            2
          ]
        }
      ],
      "role": "clean_bedding",
      "maintainers": [
        "resident-ウルリケ"
      ]
    },
    {
      "symbol": "Q",
      "name": "使用済み敷料の蓋付き受け",
      "owner": "農家のカールとウルリケの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ウルリケが手入れする案",
      "rect": [
        10,
        11,
        3,
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
          "activity": "使用済み敷料の蓋付き受けを使う",
          "rect": [
            8,
            11,
            2,
            2
          ]
        }
      ],
      "role": "used_bedding",
      "maintainers": [
        "resident-ウルリケ"
      ]
    },
    {
      "symbol": "E",
      "name": "集めた卵を籠へ移す台",
      "owner": "農家のカールとウルリケの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ウルリケが手入れする案",
      "rect": [
        6,
        10,
        2,
        2
      ],
      "access": [
        [
          6,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "集めた卵を籠へ移す台を使う",
          "rect": [
            6,
            8,
            2,
            2
          ]
        }
      ],
      "role": "egg_collection",
      "maintainers": [
        "resident-ウルリケ"
      ]
    }
  ],
  "issues": [
    "鶏の収容と止まり木・巣箱の容量、高さと個体ごとの居場所は未照合",
    "餌と水の量・補充、卵の扱いと敷料・糞の搬出と衛生は未照合",
    "鶏の出入口と屋外の囲い、寒さと灰を避ける換気、地形と日課・描画は未照合"
  ],
  "design_dependencies": [
    "building-coop",
    "resident-ウルリケ"
  ],
  "origin": [
    0,
    0
  ],
  "animal_care": {
    "kind": "hen",
    "population_ids": [
      "hen-1",
      "hen-2",
      "hen-3",
      "hen-4",
      "hen-5",
      "hen-6",
      "hen-7",
      "hen-8",
      "hen-9"
    ],
    "keeper": "resident-ウルリケ",
    "roosts": [
      "R"
    ],
    "nests": [
      "N"
    ],
    "feed": "F",
    "water": "W",
    "bedding": "B",
    "waste": "Q",
    "egg_collection": "E",
    "capacity_status": "unverified"
  }
}
---
# 鶏小屋／1階 鶏小屋

## 鶏の居場所と人の作業

[[building-coop]] の平面案に属する。止まり木と下の敷料、産卵用の巣箱、餌と飲み水を分ける。ここで巣箱は鶏の産卵用であり、蜂の巣箱ではない。人の寝床は置かず、止まり木を住民の寝台へ数えない。布や敷料の下も占有に含め、清掃する人の身体が入る側を残す。

## 餌と水、卵と敷料

ウルリケが世話をする。乾いた敷料と使用済みの受け、卵を籠へ移す台を分け、人の食材の保管や飲用水と同じ容器を使わない。餌と水の量・補充、産卵と卵の衛生、敷料と糞の搬出先・量と回収は未照合である。

## 現行の鶏との対応

animal_care の population_ids は `world/town/animals.ts` の個体IDを参照する。現行の鶏の数・外見・歩く範囲は同じ関数を正とし、本資料へ数値を写さない。小屋へ戻って休む提案であり、市場付近にいる鶏の帰路や時刻を実装済みとはしない。収容・止まり木と巣箱の容量、各個体の呼び名、屋外の囲いと鶏の出入口、寒さと換気・灰への対処は未設計である。

## 帰宅先と描画

世帯の六人の寝床と食事は [[building-farmhouse]] に維持する。二つの人の戸口と使用面を身体幅で照合するが、鶏の生活や設備の衛生・容量を確認済みとはしない。敷地と家・畑と道、地形・立体と描画は引き続き照合する。

```grid
##############
#RRRRRRR..NNN#
#RRRRRRR..NNN#
#.........NNN#
D............#
D............#
#............#
#FFF......WWW#
#FFF......WWW#
#............D
#.....EE.....D
#BBB..EE..QQQ#
#BBB......QQQ#
##############
```
