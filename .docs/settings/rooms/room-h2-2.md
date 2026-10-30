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
      "#LL.........BB#",
      "#LL.........BB#",
      "#LL......MMMBB#",
      "#LL..SS..MMMBB#",
      "#....SS..MMM..#",
      "#FF..SS..MMM..#",
      "#EE..SS..CC...#",
      "#EE..SS.......#",
      "#EE..SS.......#",
      "#EE..SS....P..#",
      "#HH..SS.GG.P..#",
      "#....SS.......#",
      "#....SS.......#",
      "#....SS.......#",
      "#.............#",
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
        4
      ],
      "target_access": [
        4,
        14
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
        12,
        1,
        2,
        4
      ],
      "access": [
        [
          11,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "寝具を整えて横になる",
          "rect": [
            10,
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
          12,
          5
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
            12,
            5,
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
        4,
        2,
        11
      ],
      "access": [
        [
          7,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "階段の昇降口で向きを変える",
          "rect": [
            7,
            4,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "P",
      "name": "糸と布・針箱の開放棚",
      "owner": "ベルタ",
      "source": "町の木工師への造作依頼",
      "rect": [
        11,
        10,
        1,
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
          "activity": "糸と布・針箱を出し入れする",
          "rect": [
            8,
            9,
            3,
            2
          ]
        }
      ],
      "role": "storage",
      "compartments": [
        "糸の包み",
        "完成した布",
        "ベルタの蓋付き針箱"
      ],
      "runtime_kind": "shelf",
      "runtime_solid": true,
      "shelf": {
        "height_m": 1.2,
        "board_thickness_m": 0.025,
        "board_tops_m": [
          0.12,
          0.65,
          1.2
        ],
        "front": "w",
        "contents": [
          {
            "id": "P-repair-kit",
            "name": "ベルタの蓋付き針箱",
            "owner": "ベルタ",
            "source": "ゴットフリートへ製作を依頼する木箱の案",
            "kind": "box",
            "board": 1,
            "across_m": -0.25,
            "from_back_m": 0.21,
            "width_m": 0.24,
            "height_m": 0.08,
            "depth_m": 0.16,
            "wall_thickness_m": 0.008,
            "lid_thickness_m": 0.008,
            "lid_lift_m": 0.08,
            "retrieval": {
              "withdraw_m": 0.28,
              "body_radius_m": 0.4,
              "body_across_m": -0.5,
              "body_start_m": 0.4,
              "body_end_m": 0.68,
              "space_index": 0
            }
          }
        ]
      }
    }
  ],
  "issues": [
    "屋根下面と使用面の鉛直の空きは照合したが、梁・窓・織機と寝台の実物の立体は未照合",
    "織機の稼働・糸の張り方と交換・部品の搬入は未照合",
    "昼の機織りと寝床の目隠し・埃の分離は未照合",
    "箱・腰掛けと寝具・階段の立体と可動域は未照合",
    "針箱の棚内配置と取り出す平面は照合したが、糸と布の総量・腕と指の動作と蓋の操作は未照合"
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

家族三人それぞれに常用寝台と衣服箱を置き、寝台・収納の固有IDへ結ぶ。二人用という家具候補だけで人数を満たしたことにせず、三人分の占有と使用面を分ける。ルカスは北西、ベルタは北東、エミールは西側の南寄りの寝台を使う。

## 窓辺の機織り

ベルタの織機は東の窓辺に置く案とする。織機本体だけでなく、奥で糸を整える面、横から調整する面、腰掛けの出入りの床を別に取る。糸と完成した布は東南の棚 P の下段へ置く蓋付きの包みを別に設計し、個人の衣服箱や寝台へ積まない。寝具用の糸の紡ぎは [[resident-ベルタ#寝具用の糸を紡ぐ工程]] の共同の糸車を利用する案へ分け、自宅の織機で紡ぐ扱いにしない。原毛の受取りと洗浄・乾燥、作業場と家を往復する材料の保管・搬入、仕入れと家族の仕事に接続する日課は別に照合する。

## 階段と生活の干渉

[[room-h2-1]]から同じ位置の階段で上がる。階段の使用面から織機と各寝台へ進める平面案とし、寝台を通り抜けの通路に使わない。三人の就寝中に機織りまで同時に成立すると決めず、音と埃、明かり、目隠しを別に設計する。

## 平面案

一セルは半メートルである。

```grid
###############
#LL.........BB#
#LL.........BB#
#LL......MMMBB#
#LL..SS..MMMBB#
#....SS..MMM..#
#FF..SS..MMM..#
#EE..SS..CC...#
#EE..SS.......#
#EE..SS.......#
#EE..SS....P..#
#HH..SS.GG.P..#
#....SS.......#
#....SS.......#
#....SS.......#
#.............#
###############
```

屋根裏の壁際を床面積だけで利用可能とせず、頭上高と窓、織機の動作・糸の交換・階段を通る部品の大きさを立体で照合してから描画へ渡す。


## 織機を動かす時間の分離

織機 M は家族が起きている間の仕事に使う。`world/town/routines.ts` のベルタの機織りが、同室に寝台を持つルカスとエミールの睡眠に重ならないことを一日の全分で検査する。家族の就寝中は [[room-h2-1#就寝中の家族と夜の繕い]] へ分ける。この時間の分離は、機織りの埃や昼の目隠し、床を伝わる音の対策を設計済みにするものではない。


## 階段上端と機織りの手入れ

階段の北側へ空いた床を残し、西側のルカスとエミールの寝床へ進む。北東へ移したベルタの寝台の使用面は、織機の奥で糸を整える面と同じ本人が時間を分けて使う。寝具を置いたまま作業面へ広げず、機を動かす前に寝具と私物を寝台へ戻す。

階段の上端の横を織機の調整面で占有しないよう、横から手を入れる使用面を東側へ移した。東側の床へは腰掛けの南を回って入る。段と踊り場・床開口、屋根下面は [[building-h2#階段と屋根下面の断面案]] に従い、糸の交換の姿勢や寝具・布を持って上がる立体の動作は別に照合する。


## 糸と布の棚と針箱

P は西へ開く浅い棚の案とし、側板と棚板を持つ。針箱は中段の北寄り、前縁に近い位置へ置く。箱の外寸と板・蓋の厚みは shelf.contents の P-repair-kit を正とし、[[room-h2-1#針箱の閉じた内側]] は同じ箱を ID で参照する。下段の糸と完成した布の数量・包みはまだ割り当てておらず、空いた段へ未設計の布を積んだことにしない。

箱は西へまっすぐ引き、本人は同じ方向へ下がる平面の案を持つ。棚の前へ箱全体が出る距離と身体の場所、左右の前縁へ届く平面を照合する。指と腕を含む実際の姿勢、箱を保持したまま蓋を開く場所、布と糸の総量、棚の支持・固定と窓からの灰、階段の搬送は引き続き設計する。
