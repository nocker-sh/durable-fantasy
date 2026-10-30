---
{
  "id": "building-h3",
  "kind": "buildings",
  "title": "ヤコブとエルザの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "household": "fisher",
  "residents": [
    "resident-ヤコブ",
    "resident-エルザ",
    "resident-パウル",
    "resident-レナ"
  ],
  "rooms": [
    "room-h3-1",
    "room-h3-2",
    "room-h3-3",
    "room-h3-4"
  ],
  "role": "home",
  "issues": [
    "魚と網の仕事場、家庭の洗濯と仕事の洗濯、屋外の搬入経路は未設計",
    "便所・汚水・灰と燃料、窓・煙突・戸と子どもの寝間の目隠しは未照合",
    "拡張した敷地と地形・隣家の屋根、日課と描画の照合は未完了"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h3-1",
    "room-h3-2",
    "room-h3-3",
    "room-h3-4",
    "facility-square-well"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 16,
    "depth": 18,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h3-1",
          "room-h3-2",
          "room-h3-4"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h3-3"
        ]
      }
    ]
  },
  "facilities": [
    "facility-square-well"
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
      "lower_room": "room-h3-1",
      "upper_room": "room-h3-3",
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
    "material": "roof2"
  },
  "site_plan": {
    "origin": [
      11.45,
      26.85
    ],
    "rotation_quarters": 2,
    "status": "proposed",
    "unresolved": [
      "地面の高さ・隣家の窓と煙突・浜の仕事場への荷の動線",
      "果物屋の窓と手入れの通路・地面の高さの照合",
      "鍛冶場の煙・火と子どもの寝間の窓、燃料と洗濯物の離隔"
    ],
    "approaches": [
      {
        "room": "room-h3-1",
        "door": [
          4,
          17
        ],
        "width_m": 1,
        "points_tiles": [
          [
            15.378571428571428,
            26.85
          ],
          [
            15.378571428571428,
            25.9
          ],
          [
            14.5,
            24.5
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
# ヤコブとエルザの家

## 使い手と役割

魚屋のヤコブとエルザの建物である。同居人はヤコブ、エルザ、パウル、レナ。川の漁と、浜の網小屋での海の漁と魚屋。エルザは洗濯の仕事。息子のパウルが網を手伝う。

## 部屋の構成

1階の[[room-h3-1]]を持つ。1階の[[room-h3-2]]を持つ。2階の[[room-h3-3]]を持つ。1階の[[room-h3-4]]を持つ。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事場を持たない場合も、日常の掃除・衣服の手入れ・修理道具を置く場所を決める。

## 現状との差分

現行の家具候補は干し網、魚桶、食卓、寝台（二人用）、子どもの寝台×2、洗濯桶、椅子×4。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。

## 家族の生活から組む平面案

西の土間で漁の濡れた物を受け、東北で食事を作り、東南に子どもの寝間を置く。両親だけが西の階段から上階へ進む。子どもの寝間を通り抜けず、清潔な衣服と魚・網を分ける。家庭の洗濯桶を客の洗濯設備の代わりにしない。四人の寝台と個人収納は本人の資料へ結び付ける。現行の外観と位置はまだ切り替えず、実寸に合わせた敷地案として照合する。

## 隣地で残る照合

西南の果物屋は[[building-h8]]の敷地案を西南へ寄せ、双方の屋根の張出しを平面で照合する。窓と排水、地面の高さと手入れする通路は別に照合する。西の[[building-smithy]]からの煙と火、子どもの寝間の窓と洗濯物・燃料の位置も残る。
