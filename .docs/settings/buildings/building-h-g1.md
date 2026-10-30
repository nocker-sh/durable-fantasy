---
{
  "id": "building-h-g1",
  "kind": "buildings",
  "title": "テオの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-gate",
  "household": "guide",
  "residents": [
    "resident-テオ"
  ],
  "rooms": [
    "room-h-g1-1",
    "room-h-g1-2"
  ],
  "role": "home",
  "issues": [
    "窓・煙突・火と紙や濡れ物の離隔と換気は未設計",
    "寝具と収納の容量・戸と金具・身体と荷の立体照合未完了",
    "便所・燃料と灰・汚水の搬出先・路面と段差は未確定"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h-g1-1",
    "room-h-g1-2",
    "facility-gate-well"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 12,
    "depth": 15,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-g1-1",
          "room-h-g1-2"
        ]
      }
    ]
  },
  "floor_levels": [
    {
      "floor": 0,
      "elevation_m": 0,
      "ceiling_elevation_m": 2.6
    }
  ],
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 2.6,
    "ridge_underside_m": 4.2,
    "overhang_m": 0.3,
    "material": "thatch"
  },
  "facilities": [
    "facility-gate-well"
  ],
  "site_plan": {
    "origin": [
      29.2,
      20.4
    ],
    "rotation_quarters": 0,
    "status": "proposed",
    "unresolved": [
      "未設計の隣家の屋根と窓・地形と段差",
      "煙突・紙と火・便所と灰と汚水の場所"
    ],
    "approaches": [
      {
        "room": "room-h-g1-1",
        "door": [
          0,
          6
        ],
        "width_m": 1,
        "points_tiles": [
          [
            29.2,
            25.04285714285714
          ],
          [
            24.2,
            25.04285714285714
          ]
        ]
      }
    ]
  }
}
---

# テオの家

## 使い手と役割

案内人テオが一人で住む。道案内と荷の取り次ぎ。

## 部屋の構成

1階の[[room-h-g1-1]]を持つ。1階の[[room-h-g1-2]]を持つ。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事場を持たない場合も、日常の掃除・衣服の手入れ・修理道具を置く場所を決める。

## 現状との差分

現行の家具候補は町の絵地図、食卓、寝台、椅子×1。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。

## 一階の二室の案

壁込み六メートル×七・五メートルの地上一階の案とし、居間で案内の準備と食事、寝室で本人の就寝・衣服と記録の保管を行う。旅人の荷を大量に預かる倉庫へ役割を増やさない。西の戸から門の通りへ接続する。現行より奥行のある案であり、屋根と窓・煙突、地形と日課・描画を閉じてから外観へ反映する。
