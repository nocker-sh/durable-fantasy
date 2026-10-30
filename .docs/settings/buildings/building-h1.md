---
{
  "id": "building-h1",
  "kind": "buildings",
  "title": "ヴィルヘルムの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "household": "elder",
  "residents": [
    "resident-ヴィルヘルム",
    "resident-ゾフィー"
  ],
  "rooms": [
    "room-h1-1",
    "room-h1-2",
    "room-h1-3",
    "room-h1-4",
    "room-h1-stairs",
    "room-h1-landing"
  ],
  "role": "home",
  "issues": [
    "隣家の未設計の屋根との離隔・地形と窓・二つの煙突の位置は未照合",
    "梁・床開口・手すり・揺り椅子と内部の戸・勝手口の立体は未設計",
    "便所・灰と汚水の搬出先・換気と燃料・容量と日課の照合未完了",
    "台所の一つの煙道は上階と屋根へ接続する案。居間の暖炉の煙道と両者の排煙・熱と強度は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h1-1",
    "room-h1-2",
    "room-h1-3",
    "room-h1-4",
    "room-h1-stairs",
    "room-h1-landing",
    "facility-square-well"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 16,
    "depth": 16,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h1-1",
          "room-h1-2"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h1-stairs",
          "room-h1-landing",
          "room-h1-3",
          "room-h1-4"
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
      "lower_room": "room-h1-1",
      "upper_room": "room-h1-stairs",
      "furniture": "S",
      "risers": 14,
      "going_m": 0.28,
      "axis": "y",
      "lower_end": "end",
      "landing_depth_m": 1,
      "clear_width_m": 0.9,
      "rail_inset_m": 0.05,
      "opening_length_m": 3.64
    }
  ],
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 4.72,
    "ridge_underside_m": 6.52,
    "overhang_m": 0.3,
    "material": "roof2"
  },
  "facilities": [
    "facility-square-well"
  ],
  "site_plan": {
    "origin": [
      20.6,
      15.3
    ],
    "rotation_quarters": 3,
    "status": "proposed",
    "unresolved": [
      "隣家の屋根と窓・地形と段差",
      "暖炉と調理炉の煙突・火と薪の離隔",
      "便所と灰・汚水の搬出先"
    ],
    "approaches": [
      {
        "room": "room-h1-1",
        "door": [
          5,
          15
        ],
        "width_m": 1,
        "points_tiles": [
          [
            20.6,
            17.442857142857143
          ],
          [
            18.8,
            17.442857142857143
          ]
        ]
      },
      {
        "room": "room-h1-2",
        "door": [
          2,
          15
        ],
        "width_m": 1,
        "points_tiles": [
          [
            20.6,
            19.585714285714285
          ],
          [
            19.3,
            19.585714285714285
          ],
          [
            19,
            19.5
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
  },
  "flues": [
    {
      "lower_room": "room-h1-2",
      "hearth": "O",
      "upper_room": "room-h1-landing",
      "shaft": "H",
      "furniture_clearance_m": 0.25,
      "wall_thickness_m": 0.1,
      "floor_collar_m": 0.05,
      "floor_support": {
        "depth_m": 0.2,
        "steps": 2
      },
      "outlet_above_ridge_m": 0.6
    }
  ]
}
---

# ヴィルヘルムの家

## 使い手と役割

ヴィルヘルムと孫娘のゾフィーの建物である。同居人はヴィルヘルム、ゾフィー。隠居と庭仕事。暮らしは空き家の貸し賃で立てる。

## 部屋の構成

1階の[[room-h1-1]]を持つ。1階の[[room-h1-2]]を持つ。2階の[[room-h1-3]]を持つ。2階の[[room-h1-4]]を持つ。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事場を持たない場合も、日常の掃除・衣服の手入れ・修理道具を置く場所を決める。

## 現状との差分

現行の家具候補は暖炉の前の揺り椅子、本棚、食卓、寝台×2、鉢植え、椅子×2。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。

## 共用の動線と私室

壁込み八メートル四方の二階建て案とし、地上の居間と台所、二階の階段区画・共用の踊り場と各私室を分ける。私室の独立を保つため、階段区画と共用の踊り場を資料にも追加する。現行より大きい案であり、西へ寄せ、室内図を四分の三回転して西の道へ玄関と勝手口を接続する。隣の修道士の家などの未設計の屋根と窓、地形と段差を閉じてから外観へ反映する。


## 家庭の水を運ぶ担当

家庭の飲用と調理の水は、ゾフィーが広場の井戸で受け取り、台所で保管する案とする。容器と量、仮の運搬重量と残件は [[room-h1-2#飲用水を汲んで保管する一つの容器]] に持つ。杖を持つヴィルヘルムと一律の交代制にはせず、夜市の花や鍬と同時に運ぶ扱いにもせず、家の支度の工程へ結ぶ。水を汲む回数と家庭の消費、実際の時刻と経路・身体の照合は残る。


## 台所の調理炉と上階の煙道

[[room-h1-2#調理炉の空洞と鉄板]] の O から [[room-h1-landing#台所から通る煙道]] の H へ、共通座標で一つの断面をつなぐ。煙道の周囲の壁と床の襟、下から受ける持送り、屋根を抜けて棟より高くする出口を建物の flues で持つ。上階の寝台や衣服箱へ通さず、階段から私室への通路と分ける。

これは台所の一つの経路の案で、居間の暖炉の煙道は残る。排煙と給気・換気、熱と強度、屋根との納まりと雨仕舞、煤の清掃口と補修の日課は未照合である。煙道が全階へつながることを、炉が使用可能になったこととしない。
