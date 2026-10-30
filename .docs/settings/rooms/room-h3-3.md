---
{
  "id": "room-h3-3",
  "kind": "rooms",
  "title": "ヤコブとエルザの家／2階 寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h3",
  "floor": 1,
  "room_name": "寝室",
  "use": "寝",
  "occupants": [
    "ヤコブ",
    "エルザ"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "################",
      "#SS............#",
      "#SS..AA...BB...#",
      "#SS..AA...BB...#",
      "#SS..AA...BB...#",
      "#SS..AA...BB...#",
      "#SS............#",
      "#SS............#",
      "#SS............#",
      "#SS............#",
      "#SS..CC...FF...#",
      "#SS............#",
      "#SS............#",
      "#..............#",
      "#..............#",
      "#..............#",
      "#..............#",
      "################"
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
      "target": "room-h3-1",
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
      "name": "西の直階段",
      "owner": "ヤコブとエルザの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
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
          "activity": "西の直階段を使う",
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
      "name": "ヤコブの寝台",
      "owner": "ヤコブ",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        5,
        2,
        2,
        4
      ],
      "access": [
        [
          7,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "ヤコブの寝台を使う",
          "rect": [
            7,
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
      "name": "エルザの寝台",
      "owner": "エルザ",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        10,
        2,
        2,
        4
      ],
      "access": [
        [
          9,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "エルザの寝台を使う",
          "rect": [
            8,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "C",
      "name": "ヤコブの乾いた衣服箱",
      "owner": "ヤコブ",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        5,
        10,
        2,
        1
      ],
      "access": [
        [
          7,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "ヤコブの乾いた衣服箱を使う",
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
        "ヤコブ"
      ],
      "compartments": [
        "本人専用の箱"
      ]
    },
    {
      "symbol": "F",
      "name": "エルザの乾いた衣服箱",
      "owner": "エルザ",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        10,
        10,
        2,
        1
      ],
      "access": [
        [
          9,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "エルザの乾いた衣服箱を使う",
          "rect": [
            8,
            9,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "エルザ"
      ],
      "compartments": [
        "本人専用の箱"
      ]
    }
  ],
  "issues": [
    "戸と枠・操作する身体・窓と換気の立体照合は未完了",
    "便所・灰・汚水の搬出先、容器容量と日課・描画の照合は未完了"
  ],
  "sleeping_places": [
    {
      "id": "bed-h3-3-1",
      "resident": "resident-ヤコブ",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "家具の占有と使用面を配置。容量と開閉は未照合",
      "storage_id": "storage-h3-3-1",
      "storage_symbol": "C"
    },
    {
      "id": "bed-h3-3-2",
      "resident": "resident-エルザ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "家具の占有と使用面を配置。容量と開閉は未照合",
      "storage_id": "storage-h3-3-2",
      "storage_symbol": "F"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h3",
    "resident-ヤコブ",
    "resident-エルザ"
  ],
  "personal_storage": [
    {
      "id": "storage-h3-3-1",
      "resident": "resident-ヤコブ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人専用の箱"
    },
    {
      "id": "storage-h3-3-2",
      "resident": "resident-エルザ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "F",
      "compartment": "本人専用の箱"
    }
  ],
  "origin": [
    0,
    0
  ],
  "private_for": [
    "resident-ヤコブ",
    "resident-エルザ"
  ]
}
---
# ヤコブとエルザの家／2階 寝室

## 両親の寝床

ヤコブとエルザの寝台を別々に割り当て、本人の乾いた衣服を専用の箱に納める。濡れた網、魚桶と客の洗濯物は上げない。現行の二人用寝台という候補を人数の枠として扱い、寝具の共用で生活の不足を隠さない。

西の階段から二人とも自分の寝台へ行ける。子どもの寝間は地上に維持し、子どもが両親の寝台脇を通る必要を作らない。階段口の戸や目隠し、夜の明かり、床と梁の遮音、寝具を干す場所は未設計である。

## 平面

一セルは半メートル。隣室と共有する壁と戸口は建物の原点で合わせる。

```grid
################
#SS............#
#SS..AA...BB...#
#SS..AA...BB...#
#SS..AA...BB...#
#SS..AA...BB...#
#SS............#
#SS............#
#SS............#
#SS............#
#SS..CC...FF...#
#SS............#
#SS............#
#..............#
#..............#
#..............#
#..............#
################
```
