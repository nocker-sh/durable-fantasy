---
{
  "id": "building-h9",
  "kind": "buildings",
  "title": "アウグストの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "household": "lamp",
  "residents": [
    "resident-アウグスト",
    "resident-ヘートヴィヒ",
    "resident-ティム"
  ],
  "rooms": [
    "room-h9-1",
    "room-h9-2",
    "room-h9-3",
    "room-h9-kitchen",
    "room-h9-stairs"
  ],
  "role": "home",
  "issues": [
    "敷地と道路接続は平面案。地形・外観・隣家の立体は未照合",
    "戸の操作・窓・煙突・油と修理の火気隔離、工具と毛糸の収納容量は未照合",
    "給排水・便所・燃料と灰、寝具の乾燥・日課と描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h9-1",
    "room-h9-2",
    "room-h9-3",
    "room-h9-kitchen",
    "room-h9-stairs",
    "building-h1",
    "building-h10"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 18,
    "depth": 20,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h9-1",
          "room-h9-kitchen",
          "room-h9-2"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h9-stairs",
          "room-h9-3"
        ]
      }
    ]
  },
  "floor_levels": [
    {
      "floor": 0,
      "elevation_m": 0,
      "ceiling_elevation_m": 2.32
    },
    {
      "floor": 1,
      "elevation_m": 2.52,
      "ceiling_elevation_m": 4.72
    }
  ],
  "stair_sections": [
    {
      "lower_room": "room-h9-1",
      "upper_room": "room-h9-stairs",
      "furniture": "S",
      "risers": 14,
      "going_m": 0.28,
      "axis": "y",
      "landing_depth_m": 1,
      "clear_width_m": 0.9,
      "lower_end": "end",
      "opening_length_m": 3.64,
      "rail_inset_m": 0.05
    }
  ],
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 4.72,
    "ridge_underside_m": 6.52,
    "overhang_m": 0.3,
    "material": "thatch"
  },
  "site_plan": {
    "origin": [
      22.3,
      6.5
    ],
    "rotation_quarters": 2,
    "status": "proposed",
    "unresolved": [
      "地形と段差、窓・煙突・手入れの通路と修理品の搬送"
    ],
    "approaches": [
      {
        "room": "room-h9-1",
        "door": [
          4,
          0
        ],
        "width_m": 0.8,
        "points_tiles": [
          [
            26.942857142857143,
            13.642857142857142
          ],
          [
            26.942857142857143,
            14.1
          ],
          [
            19.5,
            14.1
          ],
          [
            19.5,
            16.6
          ],
          [
            18.4,
            16.6
          ]
        ]
      }
    ]
  },
  "runtime_graphics_omissions": {
    "source": "world/town/interiors.ts",
    "pieces": []
  }
}
---
# アウグストの家

## 灯りを直す家族の家

アウグストが手提げの灯りと燭台を修理し、ヘートヴィヒが首巻きを編み、孫のティムを育てる。油はジーモン、芯はアガーテから受ける。

## 地上階と上階の使い分け

地上の [[room-h9-1]] で修理の受渡しを行い、[[room-h9-kitchen]] で調理と食事を行う。祖父母は地上の [[room-h9-2]] で眠り、ティムは [[room-h9-stairs]] から [[room-h9-3]] へ上がる。客の経路と寝室を分け、修理台を食卓に使わない。

敷地案は現行位置から北へ寄せ、入口を南に向ける。[[building-h1]] と [[building-h10]] の北側を回って道路へ出る。現行の外観と位置はまだ切り替えない。平面の成立と、油の保管や火気・換気、生活設備の成立を区別する。
