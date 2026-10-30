---
{
  "id": "building-h8",
  "kind": "buildings",
  "title": "オットーとクララの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "household": "fruit",
  "residents": [
    "resident-オットー",
    "resident-クララ",
    "resident-ヨナス"
  ],
  "rooms": [
    "room-h8-1",
    "room-h8-2",
    "room-h8-3",
    "room-h8-4",
    "room-h8-stairs"
  ],
  "role": "home",
  "issues": [
    "戸と窓・煙突・梁、隣家との窓や手入れする通路の立体は未照合",
    "果樹園と売り場への物流、家庭と客の洗濯、寝具の乾燥は未設計",
    "便所・給排水・燃料と灰・収納容量、地形と日課・描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h8-1",
    "room-h8-2",
    "room-h8-3",
    "room-h8-4",
    "room-h8-stairs",
    "facility-square-well",
    "building-h3",
    "building-h4",
    "building-h7",
    "facility-h8-privy",
    "facility-h8-treatment",
    "facility-h8-nonfood-plot"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 14,
    "depth": 20,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h8-1",
          "room-h8-2"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h8-stairs",
          "room-h8-3",
          "room-h8-4"
        ]
      }
    ]
  },
  "facilities": [
    "facility-square-well",
    "facility-h8-privy",
    "facility-h8-treatment",
    "facility-h8-nonfood-plot"
  ],
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
      "lower_room": "room-h8-1",
      "upper_room": "room-h8-stairs",
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
    "material": "roof2"
  },
  "site_plan": {
    "origin": [
      5.8,
      34.8
    ],
    "rotation_quarters": 0,
    "status": "proposed",
    "unresolved": [
      "敷地の高さと段差、窓・煙突・手入れの通路、果樹園と売り場への搬送"
    ],
    "approaches": [
      {
        "room": "room-h8-1",
        "door": [
          13,
          10
        ],
        "width_m": 1,
        "points_tiles": [
          [
            10.8,
            38.72857142857143
          ],
          [
            18.2,
            38.72857142857143
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
        "name": "台所"
      }
    ]
  }
}
---
# オットーとクララの家

## 使い手と役割

果物屋のオットーとクララの建物である。同居人はオットー、クララ、ヨナス。南門の外の果樹園（りんご・梨・すもも・ぶどう）と果物の店。ぶどうはフランツへ。クララは洗濯の仕事。

## 部屋の構成

1階の[[room-h8-1]]を持つ。1階の[[room-h8-2]]を持つ。2階の[[room-h8-3]]を持つ。2階の[[room-h8-4]]を持つ。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事場を持たない場合も、日常の掃除・衣服の手入れ・修理道具を置く場所を決める。

## 現状との差分

現行の家具候補は果物籠、洗濯桶（外）、食卓、寝台（二人用）、子どもの寝台、椅子×3。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。

## 家族の生活と隣家から組む平面案

地上に三人の食卓と家庭の台所を持ち、上階に共用通路と別々の寝室を置く。家の入口を売り場の入口にせず、広場の果物売り場と南門外の果樹園への仕事の移動を別に扱う。家庭の洗濯桶を客の洗濯設備で代用しない。

敷地案は西南へ寄せ、[[building-h3]]と[[building-h4]]、北の[[building-h7]]の屋根の張出しを平面で照合する。東の入口はヘレナとリーゼルの家の南を通って道へ出る。現行の建物位置や描画はまだ切り替えておらず、地形と窓・煙突、実際の物流は未解決である。
