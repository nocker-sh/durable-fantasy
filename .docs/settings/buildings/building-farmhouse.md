---
{
  "id": "building-farmhouse",
  "kind": "buildings",
  "title": "カールとウルリケの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "household": "farm",
  "residents": [
    "resident-カール",
    "resident-ウルリケ",
    "resident-フリッツ",
    "resident-ミア",
    "resident-ゲルトルート",
    "resident-ヴァルター"
  ],
  "rooms": [
    "room-farmhouse-1",
    "room-farmhouse-2",
    "room-farmhouse-3",
    "room-farmhouse-4",
    "room-farmhouse-5",
    "room-farmhouse-stairs"
  ],
  "role": "home",
  "issues": [
    "畑・牧草地・柵と納屋への作業経路、地形と段差・外観の立体は未照合",
    "給排水・便所・薪と灰・煙突、戸と窓・梁と収納容量は未設計",
    "家庭と商品の補充・飼料・洗濯と寝具の乾燥、日課と描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-farmhouse-1",
    "room-farmhouse-2",
    "room-farmhouse-3",
    "room-farmhouse-4",
    "room-farmhouse-5",
    "room-farmhouse-stairs",
    "building-barn",
    "building-coop",
    "facility-square-pasture",
    "facility-square-windmill"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 16,
    "depth": 24,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-farmhouse-1",
          "room-farmhouse-4",
          "room-farmhouse-5"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-farmhouse-stairs",
          "room-farmhouse-2",
          "room-farmhouse-3"
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
      "lower_room": "room-farmhouse-1",
      "upper_room": "room-farmhouse-stairs",
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
    "ridge_underside_m": 6.32,
    "overhang_m": 0.3,
    "material": "thatch"
  },
  "site_plan": {
    "origin": [
      37.4,
      41.5
    ],
    "rotation_quarters": 1,
    "status": "proposed",
    "unresolved": [
      "地形と段差、窓・煙突・手入れの通路と畑・納屋への搬送"
    ],
    "approaches": [
      {
        "room": "room-farmhouse-1",
        "door": [
          15,
          3
        ],
        "width_m": 0.8,
        "points_tiles": [
          [
            38.82857142857143,
            41.5
          ],
          [
            38.82857142857143,
            41.1
          ],
          [
            41.8,
            41.1
          ],
          [
            41.8,
            34
          ],
          [
            40.91428571428572,
            34
          ],
          [
            40.91428571428572,
            31.97142857142857
          ]
        ]
      }
    ]
  },
  "runtime_layout_omissions": {
    "source": "world/town/floorplan/floor-plan.ts",
    "rooms": [
      {
        "floor": 0,
        "name": "ゲルトルートの部屋"
      }
    ]
  },
  "facilities": [
    "facility-square-pasture",
    "facility-square-windmill"
  ]
}
---
# カールとウルリケの家

## 農家の六人の住まい

カールとウルリケ、フリッツとミア、祖母ゲルトルート、住み込みの作男ヴァルターが暮らす。麦と野菜、鶏と豚、巣箱の蜜を扱い、麦はカールが風車で粉にする。仕事の全量を住まいへ詰め込まず、[[building-barn]] と [[building-coop]]、畑と家畜の場所を分ける。

## 家庭の平面

[[room-farmhouse-1]] に六人の食卓と調理を持つ。祖母は地上の [[room-farmhouse-4]]、ヴァルターは別室の [[room-farmhouse-5]] で眠る。家庭の保存食は台所の専用棚へ置く。共用の [[room-farmhouse-stairs]] から [[room-farmhouse-2]] と [[room-farmhouse-3]] に入る。六人に一つずつ寝台と個人の収納を割り当てる。

## 畑と家畜から家へ帰る経路

敷地案は南東の牧草地の南へ置き、北向きの入口から牧草地の西を回って道へ出る。納屋と鶏小屋の移設で家を収めたことにしない。家族が農具や収穫物を持って通る経路、柵と門、地形と段差はまだ照合していない。現行の家の位置と外観、住民の日課と描画は切り替えない。

牧草地の所有と入口・飼育と手入れは [[facility-square-pasture]] を参照する。


## 牧草地の前室を避ける接近

[[facility-square-pasture#牧草地の北西を前室へ分ける敷地候補]] に合わせ、前室の南で西へ回ってから入口の道へ進む。前室を閉じた障害物として残し、近隣の屋根と道への接続・身体幅を同時に照合する。荷を持つ移動とすれ違いの成立とは区別する。
