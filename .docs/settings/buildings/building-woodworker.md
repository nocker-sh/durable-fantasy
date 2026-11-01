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
    "room-woodworker-kitchen",
    "room-woodworker-3"
  ],
  "role": "shop",
  "issues": [
    "基礎と外階段の支持・手すり、床下の通風・排水、戸の操作と荷を持つ出入りは未設計",
    "原木と長材の屋外作業場・両開き戸の保持金具と立体の姿勢と荷の搬入は未設計",
    "木屑と火・二つの炉と煙突・換気と音の居住部への影響は未照合",
    "梁と床開口・手すり・内部の戸と物を持つ姿勢は未照合",
    "収納容量と井戸・便所・灰と汚水・日課の照合未完了"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "map-phanthiet-craft",
    "room-woodworker-1",
    "room-woodworker-2",
    "room-woodworker-3",
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
          "room-woodworker-1",
          "room-woodworker-2"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-woodworker-stairs",
          "room-woodworker-kitchen",
          "room-woodworker-3"
        ]
      }
    ]
  },
  "foundation": {
    "floor_elevation_m": 0.8,
    "floor_thickness_m": 0.2,
    "minimum_ground_gap_m": 0.2
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
      "lower_room": "room-woodworker-2",
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
      13.4
    ],
    "rotation_quarters": 0,
    "status": "proposed",
    "unresolved": [
      "屋外の原木と長材・仕事場と荷の転回",
      "未設計の隣家の屋根と窓、基礎と外階段の支持・戸と荷の動作",
      "外階段の下の踊り場から道への路面材と整地の支持・排水、材料と完成品の搬送は未照合",
      "火と木屑・便所と灰と汚水の搬出先"
    ],
    "approaches": [
      {
        "room": "room-woodworker-1",
        "door": [
          1,
          15
        ],
        "width_m": 1.5,
        "points_tiles": [
          [
            17.285714285714285,
            19.114285714285714
          ],
          [
            17.285714285714285,
            21.65714285714286
          ],
          [
            17.285714285714285,
            23.2
          ]
        ],
        "section": {
          "status": "proposed",
          "scope": "straight_road_profile",
          "road_index": 0,
          "maximum_longitudinal_grade": 0.1,
          "maximum_cut_m": 0.1,
          "maximum_fill_m": 0.15,
          "pending": [
            "路面の材料と支持・端の納まり",
            "雨水の排出先と滑り・夜の灯り",
            "人と荷を持つ動作と日課の照合"
          ]
        }
      }
    ]
  },
  "entry_opening_height_m": 2.1,
  "entry_steps": [
    {
      "room": "room-woodworker-1",
      "door": [
        1,
        15
      ],
      "risers": 3,
      "going_m": 0.28,
      "clear_width_m": 1.5,
      "rail_inset_m": 0.05,
      "rail_height_m": 0.9,
      "landing_depth_m": 1.5,
      "lower_elevation_m": 0.21
    }
  ]
}
---

# ゴットフリートの木工所

## 使い手と役割

木工師のゴットフリートの建物である。同居人はゴットフリート、アントン。木工。原木は木こりから。息子のアントンは樽を組む。

## 部屋の構成

地上階は道に面した[[room-woodworker-1]]と、その裏の[[room-woodworker-2]]に分ける。客は店先で品を受け取り、工房へは売り台の裏の戸から家族と働き手だけが入る。上階は工房の階段から[[room-woodworker-stairs]]、[[room-woodworker-kitchen]]を通って[[room-woodworker-3]]へつなぐ。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事の設備は「木工台」。材料、仕掛品、完成品、道具の収納と手入れ場所を区別する。

## 現状との差分

現行の家具候補は木工台、鉋と鋸、弓の並んだ棚、削り馬、卓、寝台×2、椅子×2で、木材は屋外に積む。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。

## 工房と家族の居住部

壁込み八メートル四方の二階建て案とし、地上を店先と工房、上階を家族の階段区画・台所と寝間へ分ける。父子と働きに来るニクラスを workers に持ち、同居する residents と区別する。現在の三室に台所と階段区画を追加する計画であり、既存の描画の追認ではない。道幅と軒に収まるよう北へ寄せた敷地案を持ち、長材と屋外の仕事場・煙突や木屑と火、日課と描画を照合してから反映する。

## 地形と地上階の床

提案した敷地の全域で、地形の補間格子と敷地の端を使って床下面の離隔を照合する。床面・厚さ・最低離隔は foundation に持ち、室内の floor_levels は地上階からの相対高さを保持する。現行の地形と計画道路を用いる検査を `scripts/lib/woodworker-site.test.ts` に置く。

これは地形へ床を埋めないための床高案であり、支持する石と梁、床下の通風・排水、湿気と木材の保管を確定するものではない。道路から床まで段差が残る。入口の外階段と踊り場の支持・手すり、戸を扱う身体、短材と長材を持つ出入りを同じ高さで照合するまで、既存の平面の搬入経路を屋外へ連続する経路として扱わない。

## 道側の入口に残る制約

以前の位置では上下の踊り場が道との間に収まらないため、敷地案を北へ寄せた。床高も移動後の地形へ合わせ、南の戸口から幅を持つ外階段と上下の踊り場を置く案を entry_steps に持つ。道・隣家の現行と提案の占有・地形への干渉を照合し、踊り場を狭めて収めない。

下の踊り場から道までは section に直進する高さ面の案を持つ。幅全体を道の現況の高さへ連続して合わせ、縦断勾配と切土・盛土の深さを検査する。これは完成した路面ではなく、路面材と整地の支持・排水、階段の支持と手すり、戸を扱う身体と荷を持つ動作、長材や完成家具の運搬を照合してから採用する。部材の平面の幅だけで階段を運べるとは判定しない。
