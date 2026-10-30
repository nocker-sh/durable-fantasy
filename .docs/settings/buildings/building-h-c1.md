---
{
  "id": "building-h-c1",
  "kind": "buildings",
  "title": "ハインリヒの窯場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-craft",
  "household": "potter",
  "residents": [
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
  ],
  "rooms": [
    "room-h-c1-1",
    "room-h-c1-entry",
    "room-h-c1-materials",
    "room-h-c1-lower-stairs",
    "room-h-c1-upper-stairs",
    "room-h-c1-2",
    "room-h-c1-3",
    "room-h-c1-upper-hall",
    "room-h-c1-kitchen",
    "room-h-c1-drying"
  ],
  "role": "workshop",
  "issues": [
    "窯を含む敷地と道・隣家・地形、戸と窓・梁は未照合",
    "土と釉の保管・成形と乾燥・焼成と冷却の工程、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h-c1-1",
    "room-h-c1-entry",
    "room-h-c1-materials",
    "room-h-c1-lower-stairs",
    "room-h-c1-upper-stairs",
    "room-h-c1-2",
    "room-h-c1-3",
    "room-h-c1-upper-hall",
    "room-h-c1-kitchen",
    "room-h-c1-drying",
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ",
    "facility-pottery-kiln"
  ],
  "workers": [
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 26,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-c1-1",
          "room-h-c1-entry",
          "room-h-c1-materials",
          "room-h-c1-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h-c1-upper-stairs",
          "room-h-c1-2",
          "room-h-c1-3",
          "room-h-c1-upper-hall",
          "room-h-c1-kitchen",
          "room-h-c1-drying"
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
      "lower_room": "room-h-c1-lower-stairs",
      "upper_room": "room-h-c1-upper-stairs",
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
    "ridge_underside_m": 6.5,
    "overhang_m": 0.3,
    "material": "roof"
  },
  "facilities": [
    "facility-pottery-kiln"
  ],
  "runtime_graphics_omissions": {
    "source": "world/town/interiors.ts",
    "pieces": []
  }
}
---
# ハインリヒの窯場

## 世帯と仕事

ハインリヒが器を作り、テレーゼが絵付けし、娘のアデーレが夜市で売る。釉薬の灰はモニカ、薪は木こりから受け取る既存の設定を維持する。

## 土と器、窯と家庭

[[room-h-c1-1]] はろくろ・乾燥中の器・絵付けと釉・仕事の洗い物・焼いて冷めた器を持つ。[[room-h-c1-materials]] は補充分の土と出荷の箱・戻った梱包材・破損した器を区別する。裏の焼成設備は [[facility-pottery-kiln]] として家の中の炉と分け、現行に確定した敷地や形状があるとは扱わない。

[[room-h-c1-entry]] と [[room-h-c1-lower-stairs]]、[[room-h-c1-upper-stairs]] と [[room-h-c1-upper-hall]] は家族の経路を持つ。[[room-h-c1-2]] は両親の寝室、[[room-h-c1-3]] は上階へ移すアデーレの個室とし、既存の寝台と衣服箱のIDを維持する。[[room-h-c1-kitchen]] は三人の家庭の食事と調理、[[room-h-c1-drying]] は衣服と寝具の手入れを持つ。夜市から帰る娘が工房や窯を通り抜けて寝床へ行く前提にしない。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。裏の窯と工作・材料と器の運搬経路、土と釉・粉塵・排水と廃物、成形と乾燥・焼成と冷却の条件と所要量、薪と灰・煙と換気・火と構造、敷地と道・隣家・地形、便所と家庭の給排水・衣服と寝具、仕事と夜市・休息の時間、立体を詰めてから描画へ渡す。
