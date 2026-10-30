---
{
  "id": "room-h5-2",
  "kind": "rooms",
  "title": "グレーテとアンナの家／2階 屋根裏の寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h5",
  "floor": 1,
  "room_name": "屋根裏の寝室",
  "use": "寝",
  "occupants": [
    "グレーテ",
    "アンナ"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "############",
      "#SS........#",
      "#SS........#",
      "#SS.GG..AA.#",
      "#SS.GG..AA.#",
      "#SS.GG..AA.#",
      "#SS.GG..AA.#",
      "#SS........#",
      "#SS........#",
      "#SS.CC..FF.#",
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
      "target": "room-h5-1",
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
      "name": "一階からの直階段",
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
          1
        ]
      ],
      "use_space": [
        {
          "activity": "階段の上端へ出入りする",
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
      "symbol": "G",
      "name": "グレーテの寝台",
      "owner": "グレーテ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        4,
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
          "activity": "寝具を整えて横になる",
          "rect": [
            6,
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
      "name": "アンナの寝台",
      "owner": "アンナ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        8,
        3,
        2,
        4
      ],
      "access": [
        [
          7,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "寝具を整えて横になる",
          "rect": [
            6,
            3,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "C",
      "name": "グレーテの衣服箱",
      "owner": "グレーテ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        4,
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
      "use_space": [
        {
          "activity": "衣服と私物を出し入れする",
          "rect": [
            6,
            8,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "グレーテ"
      ],
      "compartments": [
        "本人の区画"
      ]
    },
    {
      "symbol": "F",
      "name": "アンナの衣服箱",
      "owner": "アンナ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        8,
        9,
        2,
        1
      ],
      "access": [
        [
          7,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "衣服と私物を出し入れする",
          "rect": [
            6,
            8,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "アンナ"
      ],
      "compartments": [
        "本人の区画"
      ]
    }
  ],
  "issues": [
    "個人収納の容量・蓋と寝具・着替えの姿勢は未照合",
    "屋根と梁・階段開口と手すり・目隠しと換気の立体照合未完了",
    "就寝と夜の灯り・日課の移動は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h5-2-1",
      "resident": "resident-グレーテ",
      "kind": "個別寝台",
      "grid_symbol": "G",
      "storage_status": "本人の衣服箱へ配置。容量と可動域は未照合",
      "storage_id": "storage-h5-2-1",
      "storage_symbol": "C"
    },
    {
      "id": "bed-h5-2-2",
      "resident": "resident-アンナ",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "本人の衣服箱へ配置。容量と可動域は未照合",
      "storage_id": "storage-h5-2-2",
      "storage_symbol": "F"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h5",
    "resident-グレーテ",
    "resident-アンナ"
  ],
  "personal_storage": [
    {
      "id": "storage-h5-2-1",
      "resident": "resident-グレーテ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人の区画"
    },
    {
      "id": "storage-h5-2-2",
      "resident": "resident-アンナ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "F",
      "compartment": "本人の区画"
    }
  ],
  "origin": [
    0,
    0
  ]
}
---

# グレーテとアンナの家／2階 屋根裏の寝室

## 姉妹それぞれの寝台

グレーテとアンナに個別の寝台と衣服箱を置き、既存の寝台・収納IDへ対応させる。中央からそれぞれの寝台の長辺へ入り、他人の寝台をまたいで使わない。寝具を整える床と衣服箱を扱う床は二人が順に使い、同じ場所へ同時に立つことにしない。

## 食品と仕事の荷を持ち込まない

衣服と首巻き・私物は本人の衣服箱へ分ける。翌日の売り物、預かっている客の洗濯物、濡れた仕事着と靴は寝台と個人収納へ積まない。客の物を保管する容積を、本人たちの寝具と衣服の枠で確保したことにしない。

## 屋根裏と階段

[[room-h5-1]]から西の直階段で上がる。上端の踊り場から中央の床へ入り、寝台と衣服箱の使用面へ進む。[[building-h5]]の床高・階段・床開口と屋根下面の断面に合わせる。梁と開口の縁、手すり、夜の灯りと目隠し、窓と換気は別に立体で設計する。

## 平面案

一セルは半メートルである。

```grid
############
#SS........#
#SS........#
#SS.GG..AA.#
#SS.GG..AA.#
#SS.GG..AA.#
#SS.GG..AA.#
#SS........#
#SS........#
#SS.CC..FF.#
#SS........#
#SS........#
#SS........#
############
```
