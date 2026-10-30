---
{
  "id": "building-h-m1",
  "kind": "buildings",
  "title": "エーリヒの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-market",
  "household": "scribe",
  "residents": [
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
  ],
  "rooms": [
    "room-h-m1-office",
    "room-h-m1-entry",
    "room-h-m1-1",
    "room-h-m1-lower-stairs",
    "room-h-m1-upper-stairs",
    "room-h-m1-2",
    "room-h-m1-3",
    "room-h-m1-upper-hall",
    "room-h-m1-drying"
  ],
  "role": "home",
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "依頼の書類と紙の保管・筆記と茶売りの動線、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h-m1-office",
    "room-h-m1-entry",
    "room-h-m1-1",
    "room-h-m1-lower-stairs",
    "room-h-m1-upper-stairs",
    "room-h-m1-2",
    "room-h-m1-3",
    "room-h-m1-upper-hall",
    "room-h-m1-drying",
    "resident-エーリヒ",
    "resident-マリー"
  ],
  "runtime_graphics_omissions": {
    "source": "world/town/interiors.ts",
    "pieces": []
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
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 4.72,
    "ridge_underside_m": 6.5,
    "overhang_m": 0.3,
    "material": "roof"
  },
  "stair_sections": [
    {
      "lower_room": "room-h-m1-lower-stairs",
      "upper_room": "room-h-m1-upper-stairs",
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
  "workers": [
    "resident-エーリヒ",
    "resident-マリー"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 22,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-m1-office",
          "room-h-m1-entry",
          "room-h-m1-1",
          "room-h-m1-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h-m1-upper-stairs",
          "room-h-m1-2",
          "room-h-m1-3",
          "room-h-m1-upper-hall",
          "room-h-m1-drying"
        ]
      }
    ]
  }
}
---
# エーリヒの家

## 世帯と仕事

エーリヒが手紙と証文を代書し寄り合いの記録を取り、マリーが戸口で薬草茶を売り、子どものハンナが暮らす。薬草はイルムガルトから受け取る既存の設定を維持する。

## 客と書類、茶と家庭

[[room-h-m1-office]] に依頼を聞いて書く机と本人・客の椅子、未使用の紙と道具・預かり書類・書き終えた品を分ける。[[room-h-m1-entry]] から仕事の部屋へ行き、家族は筆記机を通らず家庭と階段へ行く。

[[room-h-m1-1]] は家庭の調理と三人の食事、戸口の茶売りの材料と清潔な茶椀・使用後を分ける。食べ物を扱う仕事と家の調理を同じ台所に持つ案だが、時間の重なり・水と器具・衛生は未照合であり、家庭の食卓を客席の代用にしない。

[[room-h-m1-lower-stairs]] と [[room-h-m1-upper-stairs]] は [[room-h-m1-upper-hall]] へつながる。[[room-h-m1-2]] は両親、[[room-h-m1-3]] はハンナの寝室として既存の寝台と個人収納のIDを維持し、[[room-h-m1-drying]] に衣服と寝具の手入れを持つ。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。道と客の待機・隣家・地形、書類の預かりと返却・目隠しと話し声・紙の乾燥と灯り、茶の提供と湯・飲用水と洗い物・材料の搬送、家の食事と営業・子どもの動線、便所と給排水・火と紙・灰、衣服と寝具の容量・勤務と休息、立体を詰めてから描画へ渡す。現行の茶の壺の未描画の記録は維持する。
