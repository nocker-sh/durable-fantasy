---
{
  "id": "room-h9-1",
  "kind": "rooms",
  "title": "アウグストの家／1階 灯りの修理場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h9",
  "floor": 0,
  "room_name": "灯りの修理場",
  "use": "灯りの修理と家の共用通路",
  "occupants": [
    "アウグスト",
    "ヘートヴィヒ",
    "ティム"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD####",
      "#SS...RR.#",
      "#SS...RR.#",
      "#SS...RR.#",
      "#SS......#",
      "#SS......#",
      "#SS...FF.#",
      "#SS...FF.#",
      "#SS......#",
      "#SS......D",
      "#SS......D",
      "#SS......#",
      "#SS......#",
      "#####DD###"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "target": "map-phanthiet",
      "door": [
        4,
        0
      ],
      "width_cells": 2
    },
    {
      "kind": "door",
      "target": "room-h9-kitchen",
      "door": [
        9,
        9
      ],
      "width_cells": 2,
      "target_door": [
        0,
        9
      ]
    },
    {
      "kind": "door",
      "target": "room-h9-2",
      "door": [
        5,
        13
      ],
      "width_cells": 2,
      "target_door": [
        5,
        0
      ]
    },
    {
      "kind": "stair",
      "target": "room-h9-stairs",
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
      "name": "上階への直階段",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
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
          "activity": "上階への直階段を使う",
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
      "symbol": "R",
      "name": "灯りを冷まして直す作業台",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        6,
        1,
        2,
        3
      ],
      "access": [
        [
          5,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "灯りを冷まして直す作業台を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "F",
      "name": "預かった灯りの棚",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        6,
        6,
        2,
        2
      ],
      "access": [
        [
          5,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "預かった灯りの棚を使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "戸の開閉・窓・換気・火気と頭上高の立体は未照合",
    "給排水・便所・燃料と灰・収納容量・日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-h9"
  ],
  "origin": [
    0,
    0
  ]
}
---
# アウグストの家／1階 灯りの修理場

## 灯りの受渡しと生活の入口

外から預かった灯りを消して冷ました状態で修理台へ渡す。食卓と修理台を共用せず、油の詰替えや点灯試験をこの配置だけで許可しない。油はジーモン、芯はアガーテから受ける。工具の収納量と火気の隔離は次に設計する。

北の入口から修理場へ入り、台所、祖父母の寝室、上階への階段へ分かれる。客を寝室へ通さず、ティムが寝るために祖父母の寝室を通る必要もない。

## 平面案

一セルは半メートル。戸口は共有壁の同じ位置へ合わせる。

## 修理台の形

修理台は木の作業面と四本の脚、下の部材受け、手道具の置場を持つ。食卓の布を掛けず、預かった灯りを消して冷ましてから扱う。現行の修理台の元の位置と大きさを描画へ渡し、名前が形状へ対応しないために消えていた状態を直す。新しい平面の採用まで完了したとはしない。

```grid
####DD####
#SS...RR.#
#SS...RR.#
#SS...RR.#
#SS......#
#SS......#
#SS...FF.#
#SS...FF.#
#SS......#
#SS......D
#SS......D
#SS......#
#SS......#
#####DD###
```

## 籠と材料の形

毛糸の籠はヘートヴィヒが使う低い柳籠とする。マティアスの羊の毛を巻いた毛糸玉を収め、底と側面の編み目、口縁と糸玉を分けて描く。糸玉を床へ散らさず、灯りの修理面へ置かない。材料と用途は `world/town/lines/households/lamp.ts` に対応する。
