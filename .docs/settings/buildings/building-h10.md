---
{
  "id": "building-h10",
  "kind": "buildings",
  "title": "修道士の家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "household": "priest",
  "residents": [
    "resident-ベネディクト",
    "resident-クレメンス"
  ],
  "rooms": [
    "room-h10-1",
    "room-h10-2"
  ],
  "role": "home",
  "issues": [
    "基礎の地盤と排水、段の支持と道への整地、窓・梁・煙突・戸の身体操作と外観の立体は未照合",
    "家庭の給排水・便所・薪と灰・寝具の乾燥と収納容量は未設計",
    "礼拝堂・治癒・寄進の粥、首飾りと煎じ薬の仕事場と日課・描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h10-1",
    "room-h10-2",
    "building-h9",
    "building-h1",
    "resident-ベネディクト",
    "resident-クレメンス",
    "map-phanthiet",
    "resident-マルクス"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 14,
    "depth": 18,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h10-1"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h10-2"
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
      "lower_room": "room-h10-1",
      "upper_room": "room-h10-2",
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
    "ridge_underside_m": 6.32,
    "overhang_m": 0.3,
    "material": "roof"
  },
  "site_plan": {
    "origin": [
      23,
      0.8
    ],
    "rotation_quarters": 1,
    "status": "proposed",
    "unresolved": [
      "基礎の地盤と排水、踊り場から道への整地、窓・煙突・屋根の灰下ろしと手入れの経路"
    ],
    "approaches": [
      {
        "room": "room-h10-1",
        "door": [
          4,
          0
        ],
        "width_m": 0.8,
        "points_tiles": [
          [
            23,
            4.014285714285714
          ],
          [
            21.114285714285714,
            4.014285714285714
          ],
          [
            21.114285714285714,
            7
          ],
          [
            21.7,
            7
          ],
          [
            21.7,
            14.2
          ],
          [
            19.5,
            14.2
          ],
          [
            19.5,
            16.6
          ],
          [
            18.4,
            16.6
          ]
        ]
      }
    ]
  },
  "workers": [
    "resident-ベネディクト",
    "resident-クレメンス"
  ],
  "foundation": {
    "floor_elevation_m": 1.15,
    "floor_thickness_m": 0.2,
    "minimum_ground_gap_m": 0.15
  },
  "entry_opening_height_m": 2,
  "entry_steps": [
    {
      "room": "room-h10-1",
      "door": [
        4,
        0
      ],
      "risers": 4,
      "going_m": 0.28,
      "clear_width_m": 0.8,
      "rail_inset_m": 0.05,
      "rail_height_m": 0.9,
      "landing_depth_m": 0.9,
      "lower_elevation_m": 0.52
    }
  ],
  "flues": [
    {
      "lower_room": "room-h10-1",
      "hearth": "F",
      "upper_room": "room-h10-2",
      "shaft": "G",
      "furniture_clearance_m": 0.5,
      "outlet_above_ridge_m": 0.6,
      "floor_collar_m": 0.15,
      "floor_support": {
        "depth_m": 0.2,
        "steps": 4
      },
      "wall_thickness_m": 0.1
    }
  ]
}
---
# 修道士の家

## 小さな礼拝堂を守る二人の家

修道士ベネディクトと見習いのクレメンスが暮らす。女神を祀り、礼拝堂の務めと治癒、町の記録を受け持つ。寄り合いの寄進と治癒のお礼で暮らし、寄進の粥を炊き、首飾りを彫り、回復薬を道具屋へ預ける。

## 家の平面と仕事の区別

地上の [[room-h10-1]] に二人の食卓、家庭の炊事、書き物と祈る場所を置く。共用階段で [[room-h10-2]] の個別寝台へ上がる。家庭の調理を、町へ配る粥や薬を扱う仕事の設備の代用にしない。

## 町への接続案

[[building-h9]] の北側に実寸の敷地案を置き、西側へ向けた入口から隣家の西を回って道へ出る。二人が住む家として必要な寸法を確保する。壁・屋根の張出しと通路幅を平面で照合し、地形と段差・隣家の窓・煙突と手入れは別に詰める。現行の建物と住民の日課、描画はまだ切り替えない。

## 地面と床、入口の段差

北側の地面の高い部分を避けて床の下面を持ち上げ、石積みの基礎で二人の家を支持する案とする。床高は世界の高さの基準、室内の floor_levels は地上階からの相対高さである。入口は上下の踊り場と四つの蹴上げ、手すりで結ぶ。隣家の北側へ階段を突き出さず、西へ降りてから南へ回り、隣家の西側を通って道へ出る。戸は内開きにして、外の上の踊り場を戸板で塞がない。

建物の占有範囲と各段・踊り場を現在の地形へ照合する。基礎の地盤と排水、床下の湿気と通風、下の踊り場から道への整地と滑り、戸を扱う身体と荷物・待機は引き続き照合する。これらの設計を、現行の建物の移設と描画への採用済みとは扱わない。

煙道の上階床は木板を石積みへ突き当てず、`floor_collar_m` の幅を石の縁へ置き換える。縁は床の厚みを通して設け、歩行面を落とさない。床梁全体、屋根の貫通と雨仕舞、壁の木下地は未設計である。

石縁は煙道と同じ石工マルクスの石積みとし、修繕時も木板で埋め戻さない。修道士の世帯が所有し、ベネディクトとクレメンスが隙間と欠けを点検する。修繕時の作業経路は別途照合する。

石縁の下は `floor_support` の段積みとし、煙道の石積みから各段を均等に張り出して受ける。最上段の外形は石縁へ一致させ、最下段は煙道の外面へ接続する。張出しの総幅は支持の深さ以下とし、木の梁を煙道へ差し込んで石縁を支える形にはしない。段積みの下端から下階床まで立位の高さを残す。これは配置と部材の連続を決める設計であり、石材と目地・荷重の耐力、床梁全体と壁の支持、基礎への伝達は引き続き照合する。

煙道の外形から `wall_thickness_m` を四方へ引いた内寸を、上下に連続する空洞とする。内装の石積みと屋根上の煙突は同じ肉厚を使い、上端に石の蓋や黒い板を張らない。屋根材は煙突の外形を切り欠き、空洞を横切らせない。焚口と喉部の断面は [[room-h10-1]] に従う。掃除口、屋根の木下地との離隔と雨仕舞は未設計である。
