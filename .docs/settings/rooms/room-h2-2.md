---
{
  "id": "room-h2-2",
  "kind": "rooms",
  "title": "ルカスとベルタの家／2階 屋根裏の寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h2",
  "floor": 1,
  "room_name": "屋根裏の寝室",
  "use": "寝",
  "occupants": [
    "ルカス",
    "ベルタ",
    "エミール"
  ],
  "bed_capacity": 3,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###############",
      "#LL..BB.......#",
      "#LL..BB.......#",
      "#LL..BB..MMM..#",
      "#LL..BB..MMM..#",
      "#........MMM..#",
      "#FF......MMM..#",
      "#EE..SS..CC...#",
      "#EE..SS.......#",
      "#EE..SS.......#",
      "#EE..SS....PP.#",
      "#HH..SS.GG.PP.#",
      "###############"
    ],
    "legend": {
      "#": "壁",
      ".": "床と使用面",
      "D": "出入口"
    }
  },
  "connections": [
    {
      "kind": "stair",
      "target": "room-h2-1",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        7,
        7
      ],
      "target_access": [
        7,
        11
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "L",
      "name": "ルカスの寝台",
      "owner": "ルカス",
      "source": "町の木工師への造作依頼",
      "rect": [
        1,
        1,
        2,
        4
      ],
      "access": [
        [
          3,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "寝具を整えて横になる",
          "rect": [
            3,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "B",
      "name": "ベルタの寝台",
      "owner": "ベルタ",
      "source": "町の木工師への造作依頼",
      "rect": [
        5,
        1,
        2,
        4
      ],
      "access": [
        [
          7,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "寝具を整えて横になる",
          "rect": [
            7,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "E",
      "name": "エミールの寝台",
      "owner": "エミール",
      "source": "町の木工師への造作依頼",
      "rect": [
        1,
        7,
        2,
        4
      ],
      "access": [
        [
          3,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "寝具を整えて横になる",
          "rect": [
            3,
            8,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "F",
      "name": "ルカスの衣服箱",
      "owner": "ルカス",
      "source": "町の木工師への造作依頼",
      "rect": [
        1,
        6,
        2,
        1
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "衣服と私物を出し入れする",
          "rect": [
            3,
            5,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "ルカス"
      ],
      "compartments": [
        "本人の区画"
      ]
    },
    {
      "symbol": "G",
      "name": "ベルタの衣服箱",
      "owner": "ベルタ",
      "source": "町の木工師への造作依頼",
      "rect": [
        8,
        11,
        2,
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
          "activity": "衣服と私物を出し入れする",
          "rect": [
            7,
            9,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "ベルタ"
      ],
      "compartments": [
        "本人の区画"
      ]
    },
    {
      "symbol": "H",
      "name": "エミールの衣服箱",
      "owner": "エミール",
      "source": "町の木工師への造作依頼",
      "rect": [
        1,
        11,
        2,
        1
      ],
      "access": [
        [
          3,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "衣服と私物を出し入れする",
          "rect": [
            3,
            10,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "エミール"
      ],
      "compartments": [
        "本人の区画"
      ]
    },
    {
      "symbol": "M",
      "name": "ベルタの織機",
      "owner": "ベルタ",
      "source": "町の木工師への造作依頼",
      "rect": [
        9,
        3,
        3,
        4
      ],
      "access": [
        [
          10,
          2
        ],
        [
          8,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "織機の奥で糸を整える",
          "rect": [
            9,
            1,
            3,
            2
          ]
        },
        {
          "activity": "織機の横で糸と部品を調整する",
          "rect": [
            7,
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
      "name": "織機の腰掛け",
      "owner": "ベルタ",
      "source": "町の木工師への造作依頼",
      "rect": [
        9,
        7,
        2,
        1
      ],
      "access": [
        [
          9,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "織る位置へ出入りする",
          "rect": [
            9,
            8,
            3,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "S",
      "name": "一階からの家族用階段",
      "owner": "carter",
      "source": "町の木工師への造作依頼",
      "rect": [
        5,
        7,
        2,
        5
      ],
      "access": [
        [
          7,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "階段の昇降口で向きを変える",
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
      "symbol": "P",
      "name": "糸と完成した布の箱",
      "owner": "ベルタ",
      "source": "町の木工師への造作依頼",
      "rect": [
        11,
        10,
        2,
        2
      ],
      "access": [
        [
          10,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "糸と布を出し入れする",
          "rect": [
            9,
            9,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "compartments": [
        "糸の包み",
        "完成した布"
      ]
    }
  ],
  "issues": [
    "屋根勾配と織機・各寝台の頭上高・窓の照合未完了",
    "織機の稼働・糸の張り方と交換・部品の搬入は未照合",
    "寝床と作業の目隠し・音・埃の干渉は未照合",
    "箱・腰掛けと寝具・階段の立体と可動域は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h2-2-1",
      "resident": "resident-ルカス",
      "kind": "個別寝台",
      "grid_symbol": "L",
      "storage_status": "本人の衣服箱へ配置。容量・可動域は未照合",
      "storage_id": "storage-h2-2-1",
      "storage_symbol": "F"
    },
    {
      "id": "bed-h2-2-2",
      "resident": "resident-ベルタ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱へ配置。容量・可動域は未照合",
      "storage_id": "storage-h2-2-2",
      "storage_symbol": "G"
    },
    {
      "id": "bed-h2-2-3",
      "resident": "resident-エミール",
      "kind": "個別寝台",
      "grid_symbol": "E",
      "storage_status": "本人の衣服箱へ配置。容量・可動域は未照合",
      "storage_id": "storage-h2-2-3",
      "storage_symbol": "H"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h2",
    "resident-ルカス",
    "resident-ベルタ",
    "resident-エミール"
  ],
  "personal_storage": [
    {
      "id": "storage-h2-2-1",
      "resident": "resident-ルカス",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "F",
      "compartment": "本人の区画"
    },
    {
      "id": "storage-h2-2-2",
      "resident": "resident-ベルタ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "G",
      "compartment": "本人の区画"
    },
    {
      "id": "storage-h2-2-3",
      "resident": "resident-エミール",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "H",
      "compartment": "本人の区画"
    }
  ],
  "origin": [
    0,
    0
  ]
}
---

# ルカスとベルタの家／2階 屋根裏の寝室

## 三人の寝床

家族三人それぞれに常用寝台と衣服箱を置き、寝台・収納の固有IDへ結ぶ。二人用という家具候補だけで人数を満たしたことにせず、三人分の占有と使用面を分ける。ルカスとベルタは北側、エミールは南西側の寝台を使う。

## 窓辺の機織り

ベルタの織機は東の窓辺に置く案とする。織機本体だけでなく、奥で糸を整える面、横から調整する面、腰掛けの出入りの床を別に取る。糸と完成した布は東南の箱の別区画へ収め、個人の衣服箱や寝台へ積まない。寝具用の糸の紡ぎは [[resident-ベルタ#寝具用の糸を紡ぐ工程]] の共同の糸車を利用する案へ分け、自宅の織機で紡ぐ扱いにしない。原毛の受取りと洗浄・乾燥、作業場と家を往復する材料の保管・搬入、仕入れと家族の仕事に接続する日課は別に照合する。

## 階段と生活の干渉

[[room-h2-1]]から同じ位置の階段で上がる。階段の使用面から織機と各寝台へ進める平面案とし、寝台を通り抜けの通路に使わない。三人の就寝中に機織りまで同時に成立すると決めず、音と埃、明かり、目隠しを別に設計する。

## 平面案

一セルは半メートルである。

```grid
###############
#LL..BB.......#
#LL..BB.......#
#LL..BB..MMM..#
#LL..BB..MMM..#
#........MMM..#
#FF......MMM..#
#EE..SS..CC...#
#EE..SS.......#
#EE..SS.......#
#EE..SS....PP.#
#HH..SS.GG.PP.#
###############
```

屋根裏の壁際を床面積だけで利用可能とせず、頭上高と窓、織機の動作・糸の交換・階段を通る部品の大きさを立体で照合してから描画へ渡す。
