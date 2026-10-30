---
{
  "id": "building-woodworker",
  "kind": "buildings",
  "title": "ゴットフリートの木工所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-craft",
  "household": "woodworker",
  "residents": [
    "resident-ゴットフリート",
    "resident-アントン"
  ],
  "rooms": [
    "room-woodworker-1",
    "room-woodworker-2",
    "room-woodworker-stairs",
    "room-woodworker-kitchen"
  ],
  "role": "shop",
  "issues": [
    "原木と長材の屋外作業場・両開き戸の保持金具と立体の姿勢と荷の搬入は未設計",
    "木屑と火・二つの炉と煙突・換気と音の居住部への影響は未照合",
    "梁と床開口・手すり・内部の戸と物を持つ姿勢は未照合",
    "収納容量と井戸・便所・灰と汚水・日課の照合未完了"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-woodworker-1",
    "room-woodworker-2",
    "room-woodworker-stairs",
    "room-woodworker-kitchen",
    "resident-ゴットフリート",
    "resident-アントン",
    "resident-ニクラス",
    "facility-square-well"
  ],
  "workers": [
    "resident-ゴットフリート",
    "resident-アントン",
    "resident-ニクラス"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 16,
    "depth": 16,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-woodworker-1"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-woodworker-stairs",
          "room-woodworker-kitchen",
          "room-woodworker-2"
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
      "lower_room": "room-woodworker-1",
      "upper_room": "room-woodworker-stairs",
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
    "material": "thatch"
  },
  "facilities": [
    "facility-square-well"
  ],
  "site_plan": {
    "origin": [
      13,
      15.8
    ],
    "rotation_quarters": 0,
    "status": "proposed",
    "unresolved": [
      "屋外の原木と長材・仕事場と荷の転回",
      "未設計の隣家の屋根と窓・地形と段差",
      "火と木屑・便所と灰と汚水の搬出先"
    ],
    "approaches": [
      {
        "room": "room-woodworker-1",
        "door": [
          10,
          15
        ],
        "width_m": 1.5,
        "points_tiles": [
          [
            17.285714285714285,
            21.514285714285716
          ],
          [
            17.285714285714285,
            23.2
          ]
        ]
      }
    ]
  }
}
---

# ゴットフリートの木工所

## 使い手と役割

木工師のゴットフリートの建物である。同居人はゴットフリート、アントン。木工。原木は木こりから。息子のアントンは樽を組む。

## 部屋の構成

1階の[[room-woodworker-1]]を持つ。2階の[[room-woodworker-2]]を持つ。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事の設備は「木工台」。材料、仕掛品、完成品、道具の収納と手入れ場所を区別する。

## 現状との差分

現行の家具候補は木工台、鉋と鋸、弓の並んだ棚、木材、寝台×2、椅子×2。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。

## 工房と家族の居住部

壁込み八メートル四方の二階建て案とし、地上を工房、上階を家族の階段区画・台所と寝間へ分ける。父子と働きに来るニクラスを workers に持ち、同居する residents と区別する。現在の二室に台所と階段区画を追加する計画であり、既存の描画の追認ではない。道幅と軒に収まるよう北へ寄せた敷地案を持ち、長材と屋外の仕事場・煙突や木屑と火、日課と描画を照合してから反映する。
