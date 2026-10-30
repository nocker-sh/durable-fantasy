---
{
  "id": "room-h4-2",
  "kind": "rooms",
  "title": "ヘレナとリーゼルの家／2階 屋根裏の寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h4",
  "floor": 1,
  "room_name": "屋根裏の寝室",
  "use": "寝",
  "occupants": [
    "ヘレナ",
    "リーゼル"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "############",
      "#SS........#",
      "#SS........#",
      "#SSHH..RR..#",
      "#SSHH..RR..#",
      "#SSHH..RR..#",
      "#SSHH..RR..#",
      "#SS........#",
      "#SS........#",
      "#SSAA..BB..#",
      "#SS........#",
      "#SS........#",
      "#SS........#",
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
      "kind": "stair",
      "furniture": "S",
      "target": "room-h4-1",
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
      "symbol": "H",
      "name": "ヘレナの寝台",
      "owner": "ヘレナ",
      "source": "大工と町の職人の仕事",
      "rect": [
        3,
        3,
        2,
        4
      ],
      "access": [
        [
          5,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "寝具・衣服を扱う、または階段上で向きを変える",
          "rect": [
            5,
            3,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "R",
      "name": "リーゼルの寝台",
      "owner": "リーゼル",
      "source": "大工と町の職人の仕事",
      "rect": [
        7,
        3,
        2,
        4
      ],
      "access": [
        [
          6,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "寝具・衣服を扱う、または階段上で向きを変える",
          "rect": [
            5,
            3,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "A",
      "name": "ヘレナの衣装箱",
      "owner": "ヘレナ",
      "source": "大工と町の職人の仕事",
      "rect": [
        3,
        9,
        2,
        1
      ],
      "access": [
        [
          5,
          9
        ]
      ],
      "role": "storage",
      "use_space": [
        {
          "activity": "寝具・衣服を扱う、または階段上で向きを変える",
          "rect": [
            5,
            8,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "B",
      "name": "リーゼルの衣装箱",
      "owner": "リーゼル",
      "source": "大工と町の職人の仕事",
      "rect": [
        7,
        9,
        2,
        1
      ],
      "access": [
        [
          6,
          9
        ]
      ],
      "role": "storage",
      "use_space": [
        {
          "activity": "寝具・衣服を扱う、または階段上で向きを変える",
          "rect": [
            5,
            8,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "S",
      "name": "階段の開口と手すり",
      "owner": "well",
      "source": "大工と町の職人の仕事",
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
          "activity": "寝具・衣服を扱う、または階段上で向きを変える",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "階段と扉の可動・頭上高・家具使用時の立体照合未完了",
    "建物外形と隣地・通路への配置未照合",
    "便所と汚水の搬出先は町全体の方式と位置が未確定",
    "二人が共用する寝台脇と衣装箱の使用順序は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h4-2-1",
      "resident": "resident-ヘレナ",
      "kind": "個別寝台",
      "grid_symbol": "H",
      "storage_status": "個人収納の区画を割り当てた。容量・開閉と出し入れの姿勢は未照合",
      "storage_symbol": "A",
      "storage_id": "storage-h4-2-1"
    },
    {
      "id": "bed-h4-2-2",
      "resident": "resident-リーゼル",
      "kind": "個別寝台",
      "grid_symbol": "R",
      "storage_status": "個人収納の区画を割り当てた。容量・開閉と出し入れの姿勢は未照合",
      "storage_symbol": "B",
      "storage_id": "storage-h4-2-2"
    }
  ],
  "guest_capacity": 0,
  "origin": [
    0,
    0
  ],
  "design_dependencies": [
    "building-h4",
    "room-h4-1",
    "resident-ヘレナ",
    "resident-リーゼル"
  ],
  "personal_storage": [
    {
      "id": "storage-h4-2-1",
      "resident": "resident-ヘレナ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "A",
      "compartment": "全体"
    },
    {
      "id": "storage-h4-2-2",
      "resident": "resident-リーゼル",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "B",
      "compartment": "全体"
    }
  ]
}
---

# ヘレナとリーゼルの家／2階 屋根裏の寝室

## 二階の個別寝台と個人収納

ヘレナの寝台は北西、リーゼルの寝台は北東に置く。中央に両方の寝台の長辺へ立てる床を残し、他人の寝台をまたいで出入りしない。それぞれの衣装箱は寝台の南側に置き、衣服と首巻きを個別に保管する。

階段上端は北の踊り場から東側の床へ出る。開口の周囲には手すりを持たせ、上がり切る前に寝台や収納へぶつからないようにする。屋根裏という名前でも、寝台の上と着替える位置に立てる頭上高が必要である。炉の煙突は東の外壁沿いへ逃がし、寝具の間を貫通させない。

## グリッド

```grid
############
#SS........#
#SS........#
#SSHH..RR..#
#SSHH..RR..#
#SSHH..RR..#
#SSHH..RR..#
#SS........#
#SS........#
#SSAA..BB..#
#SS........#
#SS........#
#SS........#
############
```

上が北、一セルは半メートル。家具の持ち主・入手元・占有・使用面はメタデータに持つ。この図は平面案であり、椅子を引く動作、階段の頭上高、扉と収納の開閉まで検証済みとはしない。

## 町とのつながり

[[facility-square-well]] から家族が水を運ぶ。リーゼルの仕事としての水運び・湯売りと、自宅の水の確保は分けて扱う。便所、灰と汚水の搬出先は [[town-phanthiet]] の設計と合わせ、未解決のまま描画へ渡さない。

## 個人収納の割当

ヘレナ、リーゼルの衣服・首巻き・私物は personal_storage の固有区画へ割り当てる。共用の食材や仕事の在庫と混ぜない。家具を共有する場合も個人の区画を分け、同じ区画を二人へ重複させない。ID の割当は収納量や開閉の確認を済ませた意味ではない。

## 直階段の実寸案

西側に両端の踊り場を含む直階段を通す。幅を広げた建物の東側へ生活の家具を置き直し、階段の上に寝台や調理炉を重ねない。段数・踏面・階の高さは[[building-h4]]の階段断面へ対応する。頭上高と床開口・手すり・足元の灯りはまだ立体で照合していない。
