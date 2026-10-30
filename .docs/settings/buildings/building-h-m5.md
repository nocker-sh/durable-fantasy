---
{
  "id": "building-h-m5",
  "kind": "buildings",
  "title": "町の寄り合い所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-market",
  "household": null,
  "residents": [],
  "rooms": [
    "room-h-m5-1",
    "room-h-m5-2",
    "room-h-m5-lower-stairs",
    "room-h-m5-upper-stairs"
  ],
  "role": "public",
  "issues": [
    "基礎と入口階段の寸法案に対する地盤・構造・雨水、道への整地と外観・戸と窓は未照合",
    "授業と寄り合い・記録の時間と音、往復と給排水・便所・燃料と換気、維持費と立体は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "resident-クリスティアン",
    "resident-エーリヒ",
    "room-h-m5-1",
    "room-h-m5-2",
    "room-h-m5-lower-stairs",
    "room-h-m5-upper-stairs",
    "map-phanthiet-market",
    "resident-マルクス"
  ],
  "workers": [
    "resident-クリスティアン",
    "resident-エーリヒ"
  ],
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
    "material": "slate"
  },
  "stair_sections": [
    {
      "lower_room": "room-h-m5-lower-stairs",
      "upper_room": "room-h-m5-upper-stairs",
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
  "layout": {
    "cell_m": 0.5,
    "width": 18,
    "depth": 20,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-m5-1",
          "room-h-m5-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h-m5-2",
          "room-h-m5-upper-stairs"
        ]
      }
    ]
  },
  "site_plan": {
    "origin": [
      40.25,
      28.5
    ],
    "rotation_quarters": 2,
    "status": "proposed",
    "unresolved": [
      "地盤と基礎・床下と雨水、下の踊り場から道への整地と勾配、通学者と集会の待機、窓と煙突・手入れの通路は未照合"
    ],
    "approaches": [
      {
        "room": "room-h-m5-1",
        "door": [
          5,
          19
        ],
        "width_m": 0.9,
        "points_tiles": [
          [
            42.75,
            28.5
          ],
          [
            42.75,
            27.785714285714285
          ],
          [
            42.75,
            26.071428571428573
          ],
          [
            42.75,
            24.4
          ]
        ]
      }
    ]
  },
  "foundation": {
    "floor_elevation_m": 0.95,
    "floor_thickness_m": 0.2,
    "minimum_ground_gap_m": 0.1
  },
  "entry_steps": [
    {
      "room": "room-h-m5-1",
      "door": [
        5,
        19
      ],
      "risers": 6,
      "going_m": 0.28,
      "clear_width_m": 0.9,
      "rail_inset_m": 0.05,
      "landing_depth_m": 1,
      "lower_elevation_m": 0.05,
      "rail_height_m": 0.9
    }
  ],
  "entry_opening_height_m": 2,
  "flues": [
    {
      "lower_room": "room-h-m5-1",
      "hearth": "H",
      "upper_room": "room-h-m5-2",
      "shaft": "H",
      "outlet_above_ridge_m": 0.6,
      "furniture_clearance_m": 0.5,
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
# 町の寄り合い所

## 共同利用と担当

[[resident-クリスティアン]] が教え、[[resident-エーリヒ]] が寄り合いの記録を扱う。日課と書記の台詞にある既存の仕事に対応する。住人は置かず、寝床と家庭の食事は各自の家に属する。

## 平面の案

[[room-h-m5-1]] に授業の席と共用卓、板と炉を置く。記録を閉じて保管する [[room-h-m5-2]] には専用の階段から入る。授業と集会の切替、記録の作業と授業の音、書類の出納と管理費は未照合である。現行の小さな外形へ収まるとは判断せず、敷地を照合してから描画へ渡す。

## 道からの敷地の案

商店通りの東端で、入口を道へ向ける回転案とする。隣の [[building-h-m4]]を消したり、道を削ったりせず、軒の張出しと入口の経路を含めて照合する。地面の高低と基礎、入口の段差・通学する子どもと集会の待機、窓と煙突・外壁の手入れは未照合であり、外観と現行の地図へ採用しない。

## 地面と入口の高低

foundation の床高は世界の高さの基準から測り、floor_levels は地上階を基準とする室内の相対高さを維持する。床の下面が地面へ埋まらない高さへ持ち上げ、石の基礎を支持する案とする。入口は上下の踊り場と手すりを持つ階段で結ぶ。階段が道路を塞がないよう敷地を南へ下げる。

地面の検査は四隅だけでなく、現行の補間に使う格子線と敷地の境界で最大と最小を求める。石の基礎の断面・地盤と沈下、床下の通風と雨水の流れ、階段の支持と手すり・戸の操作、下の踊り場から道路への整地と勾配は未照合である。地面を一括して平らにする前提にはしない。

## 階段の投影と床開口

階段の段数と床高・踏面・踊り場・開口の寸法はメタデータを使う。下階で上へ昇る階段と上階から下へ降りる階段は同じ一つの階段であり、上階にもう一つ上向きの階段を置かない。上階の床板から開口の範囲を除き、上の踊り場を床へつなぐ。開口の両脇と下側の端を手すりで囲み、上の踊り場への出入りを塞がない。階段を握る斜めの手すりと上階の開口を囲う手すりは別に持つ。通行判定では階段の踏面と開口への平面移動を止め、踊り場を空ける。階の移動の操作とサーバーの接続は別に実装する。

資料案の表示で断面を確認し、現行の町への採用は外形と入口・敷地の一致を照合してから行う。窓・梁・屋根と灯り、火と煙と給排水の設計まで完了とはしない。

煙道の上階床は木板を石積みへ突き当てず、`floor_collar_m` の幅を石の縁へ置き換える。縁は床の厚みを通して設け、歩行面を落とさない。床梁全体、屋根の貫通と雨仕舞、壁の木下地は未設計である。

石縁は煙道と同じ石工マルクスの石積みとし、修繕時も木板で埋め戻さない。町の共有設備とし、クリスティアンとエーリヒが隙間と欠けを点検する。修繕時の作業経路は別途照合する。

石縁の下は `floor_support` の段積みとし、煙道の石積みから各段を均等に張り出して受ける。最上段の外形は石縁へ一致させ、最下段は煙道の外面へ接続する。張出しの総幅は支持の深さ以下とし、木の梁を煙道へ差し込んで石縁を支える形にはしない。段積みの下端から下階床まで立位の高さを残す。これは配置と部材の連続を決める設計であり、石材と目地・荷重の耐力、床梁全体と壁の支持、基礎への伝達は引き続き照合する。

煙道の外形から `wall_thickness_m` を四方へ引いた内寸を、上下に連続する空洞とする。内装の石積みと屋根上の煙突は同じ肉厚を使い、上端に石の蓋や黒い板を張らない。屋根材は煙突の外形を切り欠き、空洞を横切らせない。焚口と喉部の断面は [[room-h-m5-1]] に従う。掃除口、屋根の木下地との離隔と雨仕舞は未設計である。
