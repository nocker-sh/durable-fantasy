---
{
  "id": "building-h5",
  "kind": "buildings",
  "title": "グレーテとアンナの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "household": "greengrocer",
  "residents": [
    "resident-グレーテ",
    "resident-アンナ"
  ],
  "rooms": [
    "room-h5-1",
    "room-h5-2"
  ],
  "role": "home",
  "issues": [
    "洗濯場・客の世帯・売り場への物流と日課の照合未完了",
    "梁・柱・階段と手すり・戸と枠・屋根と窓の立体照合未完了",
    "個人収納と室内干しの容量・湿気と換気・食品との離隔は未確定",
    "給排水・便所・燃料と灰・汚水の搬出先は未確定"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h5-1",
    "room-h5-2",
    "facility-square-well",
    "facility-square-washing",
    "facility-square-pasture"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 12,
    "depth": 14,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h5-1"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h5-2"
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
      "lower_room": "room-h5-1",
      "upper_room": "room-h5-2",
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
    "ridge_underside_m": 6.12,
    "overhang_m": 0.3,
    "material": "roof2"
  },
  "facilities": [
    "facility-square-well",
    "facility-square-washing"
  ],
  "site_plan": {
    "origin": [
      36.1,
      33.8
    ],
    "rotation_quarters": 2,
    "status": "proposed",
    "unresolved": [
      "屋根と未設計の隣家の離隔・梁と柱",
      "窓・煙突と灰・便所と汚水・地形と路面",
      "洗濯の受渡しと乾燥先・野菜の売り場への荷運び",
      "東岸への移設に伴う野菜の搬送と洗濯場・市場への往復、地形と日課"
    ],
    "approaches": [
      {
        "room": "room-h5-1",
        "door": [
          5,
          13
        ],
        "width_m": 1,
        "points_tiles": [
          [
            38.24285714285715,
            33.8
          ],
          [
            38.24285714285715,
            31.2
          ],
          [
            40.91428571428572,
            31.2
          ]
        ]
      }
    ]
  }
}
---

# グレーテとアンナの家

## 使い手と役割

八百屋のグレーテとアンナの建物である。同居人はグレーテ、アンナ。野菜の店（キャベツはカールの畑、根菜は町の菜園から）と洗濯の仕事（姉妹）。

## 部屋の構成

1階の[[room-h5-1]]を持つ。2階の[[room-h5-2]]を持つ。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事場を持たない場合も、日常の掃除・衣服の手入れ・修理道具を置く場所を決める。

## 現状との差分

現行の家具候補は野菜籠、洗濯桶、食卓、寝台×2、椅子×2。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。

## 二階と仕事の区別

壁込み六メートル×七メートルの二階建て案を持つ。一階の家庭の食材と売り物を分け、洗濯仕事の荷と本人たちの濡れ物を混同しない。二階は姉妹の常用寝台と個人の衣服に使う。階の高さ・直階段・床開口と屋根下面、戸と枠の占有を同じ平面へ合わせる。元の外観より奥行のある案であり、東岸の敷地案と隣家・川・道幅を照合してから描画する。

## 東岸の家と二つの仕事

[[building-inn]] が広場を塞がずに暮らしの部屋を持つため、家は東岸の牧草地の西、農家の北へ移す案とする。菜園や牧草地・豚の囲いを住宅の床に置き換えない。北の戸口から東へ回って既存の道へ接続する。野菜の受取りは東岸の畑へ近づく一方、洗濯場と西岸への往復は長くなる。

洗濯の仕事は [[facility-square-washing]] に維持し、家の移設を理由に洗い場を川の反対側へ増やさない。既存の橋と道を通り、荷の量・重さ、休憩と往復、濡れ物と食材の分離を日課へ照合する。自宅から道までの平面経路が通ったことを、この仕事全体の運用の証明にしない。住民の寝床と個人収納、現行の日課の定義と描画はまだ切り替えない。


## 牧草地の前室を避ける接近

北の戸からの接近路は [[facility-square-pasture#牧草地の北西を前室へ分ける敷地候補]] の前室を横切らず、西側の枝道へつなぐ。戸口と身体幅は保ち、前室を置いた後も同じ経路を照合する。
