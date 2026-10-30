---
{
  "id": "building-tavern",
  "kind": "buildings",
  "title": "フランツの酒場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-market",
  "household": "tavern",
  "residents": [
    "resident-フランツ",
    "resident-リリー",
    "resident-マックス"
  ],
  "rooms": [
    "room-tavern-1",
    "room-tavern-2",
    "room-tavern-4",
    "room-tavern-lower-stairs",
    "room-tavern-upper-stairs",
    "room-tavern-upper-hall",
    "room-tavern-drying",
    "room-tavern-3",
    "room-tavern-5",
    "room-tavern-max"
  ],
  "role": "public",
  "issues": [
    "平面案と敷地・地形・道路と隣家、屋根・戸・窓と梁は未照合",
    "樽と燃料・水・食材と器の搬送、便所と汚水・灰、醸造所と日課は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-tavern-1",
    "room-tavern-2",
    "room-tavern-3",
    "room-tavern-4",
    "room-tavern-5",
    "room-tavern-lower-stairs",
    "room-tavern-upper-stairs",
    "room-tavern-upper-hall",
    "room-tavern-drying",
    "room-tavern-max",
    "resident-フランツ",
    "resident-リリー",
    "resident-マックス"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 24,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-tavern-1",
          "room-tavern-2",
          "room-tavern-4",
          "room-tavern-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-tavern-upper-stairs",
          "room-tavern-upper-hall",
          "room-tavern-drying",
          "room-tavern-3",
          "room-tavern-5",
          "room-tavern-max"
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
      "lower_room": "room-tavern-lower-stairs",
      "upper_room": "room-tavern-upper-stairs",
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
    "ridge_underside_m": 7,
    "overhang_m": 0.3,
    "material": "roof"
  },
  "workers": [
    "resident-フランツ",
    "resident-リリー",
    "resident-マックス"
  ]
}
---
# フランツの酒場

## 使い手と役割

酒場のフランツの建物である。同居人はフランツ、リリー、マックス。酒場。酒は醸造所で自分で仕込む。給仕のリリーと、醸造の手伝いのマックスが住み込み。

## 部屋の構成

地上階の [[room-tavern-1]]・[[room-tavern-2]]・[[room-tavern-4]] を [[room-tavern-lower-stairs]] へつなぐ。上階の [[room-tavern-upper-stairs]] と [[room-tavern-upper-hall]] から、[[room-tavern-3]]・[[room-tavern-5]]・[[room-tavern-max]]・[[room-tavern-drying]] へ別々に入る。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事場を持たない場合も、日常の掃除・衣服の手入れ・修理道具を置く場所を決める。

## 現状との差分

現行の家具候補はカウンター、卓×4、樽、暖炉、寝台×3、椅子×12。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。


## 地上階の樽と住み込みの生活

酒蔵は地上階へ移す案とし、客席と台所、共用階段を別の戸でつなぐ。上階は共用廊下から主人の部屋と住み込みの寝間、室内干しへ別々に入る。三人の寝台と専用収納、既存の十二席を個別の家具として置く。リリーとマックスは家族ではなく住み込みの働き手であり、寝姿と着替え、仕事の時間と休息を区別する。

現行の敷地へこの外形を置けるとは判断しない。全階の平面と断面を先に持ち、樽の大きさと重さ、醸造の仕事場への往復と一日、外形と町の道・隣家・地形を詰めてから描画へ渡す。


## 住み込みの個室への分割

[[room-tavern-5]] をリリー、[[room-tavern-max]] をマックスの個室とする。同じ外形の中に共有壁を置き、共用廊下からそれぞれ入る。寝台・衣服箱の寸法と使用面、全階の外形は維持し、二人を家族とみなす割当や相手の寝室の通り抜けを前提にしない。現行の相部屋からの変更は平面の提案であり、壁・戸と音、灯り・勤務と休息、描画を引き続き照合する。
