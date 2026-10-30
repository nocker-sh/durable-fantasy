---
{
  "id": "building-leather",
  "kind": "buildings",
  "title": "ルドルフの革工房",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-craft",
  "household": "leather",
  "residents": [
    "resident-ルドルフ"
  ],
  "rooms": [
    "room-leather-1",
    "room-leather-2",
    "room-leather-lower-stairs",
    "room-leather-upper-stairs",
    "room-leather-3",
    "room-leather-household"
  ],
  "role": "shop",
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "なめしの工程・水と薬剤・汚水・臭気、乾燥量と搬送、家庭の生活設備・日課・描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-leather-1",
    "room-leather-2",
    "room-leather-3",
    "room-leather-lower-stairs",
    "room-leather-upper-stairs",
    "room-leather-household",
    "resident-ルドルフ"
  ],
  "workers": [
    "resident-ルドルフ"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 18,
    "depth": 22,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-leather-1",
          "room-leather-2",
          "room-leather-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-leather-upper-stairs",
          "room-leather-3",
          "room-leather-household"
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
      "lower_room": "room-leather-lower-stairs",
      "upper_room": "room-leather-upper-stairs",
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
# ルドルフの革工房

## 世帯と材料

ルドルフが一人で暮らし、革なめしと革細工を行う。獣の皮はファルク、羊の皮はマティアスから受け取り、靴の内張りの冬毛は買取屋から受け取る。品揃えと取引の値はコードを正とし、この資料で増やさない。

## 工程と暮らしの分離

[[room-leather-1]] は乾いた革の細工と完成品の受渡し、[[room-leather-2]] は受け取った皮となめし桶、水切りと途中の革、端材の受けを持つ。湿った工程の専用の搬入口を持たせ、店先と家庭の食材を搬入の途中の置場にしない。工程順に必要な移動を詰める前の平面案であり、部屋を分けたことだけで衛生・臭気・乾燥が成立したとはしない。

[[room-leather-lower-stairs]] と [[room-leather-upper-stairs]] から上階の [[room-leather-3]] と [[room-leather-household]] へ入る。既存の寝台と個人収納のIDを維持し、家庭の食事の席を一人分持つ。

## 描画へ渡す条件

なめしの方法と材料・薬剤、水と汚水の処理、皮を広げる寸法と量、乾燥時間と換気、仕事着と靴の移行、取引先との搬送、敷地と道・隣家・地形、便所・家庭の火と灰、日課と立体を照合してから描画へ渡す。現行の位置や描画を切り替えない。
