---
{
  "id": "building-armorer",
  "kind": "buildings",
  "title": "ベアトリクスの防具屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-craft",
  "household": "armorer",
  "residents": [
    "resident-ベアトリクス",
    "resident-ルイーゼ"
  ],
  "rooms": [
    "room-armorer-1",
    "room-armorer-2",
    "room-armorer-lower-stairs",
    "room-armorer-upper-stairs",
    "room-armorer-3",
    "room-armorer-4",
    "room-armorer-upper-hall",
    "room-armorer-household"
  ],
  "role": "shop",
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "材料と防具の荷重・搬送、工具と着合わせの操作、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-armorer-1",
    "room-armorer-2",
    "room-armorer-lower-stairs",
    "room-armorer-upper-stairs",
    "room-armorer-3",
    "room-armorer-4",
    "room-armorer-upper-hall",
    "room-armorer-household",
    "resident-ベアトリクス",
    "resident-ルイーゼ"
  ],
  "workers": [
    "resident-ベアトリクス",
    "resident-ルイーゼ"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 26,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-armorer-1",
          "room-armorer-2",
          "room-armorer-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-armorer-upper-stairs",
          "room-armorer-3",
          "room-armorer-4",
          "room-armorer-upper-hall",
          "room-armorer-household"
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
      "lower_room": "room-armorer-lower-stairs",
      "upper_room": "room-armorer-upper-stairs",
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
  }
}
---
# ベアトリクスの防具屋

## 世帯と仕事

ベアトリクスと住み込みの見習いルイーゼが暮らし、防具を作る。加熱する加工には職人通りの共同の炉を使う。二人の個室と私物の区画を分け、仕事の関係を家族の相部屋へ置き換えない。

## 完成品と冷めた加工品、家庭

[[room-armorer-1]] に完成した鎧と盾・注文と受渡しを置き、[[room-armorer-2]] に冷めた金属の材料と革・詰め物、工具の手入れと仕上げ・組立て中の防具・使用後の受けを分ける。重い材料の屋外の搬入口を持ち、家庭の階段を搬入路にしない。熱い物をこの部屋へ運び込むことや家庭の炉で仕事の加熱を行うことを前提にしない。

[[room-armorer-lower-stairs]] と [[room-armorer-upper-stairs]] は [[room-armorer-upper-hall]] へつながる。[[room-armorer-3]] と [[room-armorer-4]] はそれぞれ本人の個室として既存の寝台と個人収納のIDを維持する。[[room-armorer-household]] に二人の家庭の食事と調理・洗い物を持つ。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。共同の炉と仕事場を往復する工程と温度・工具、材料と防具の重量・床と運搬、油と研ぎくず・革と布の保管、着合わせする身体と視線・工具の操作、敷地と道・地形・隣家・構造、便所と給排水・家庭の火と灰、衣服と寝具の手入れ、師弟の勤務と休息、立体を詰めてから描画へ渡す。
