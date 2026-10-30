---
{
  "id": "building-chapel",
  "kind": "buildings",
  "title": "広場の礼拝堂",
  "status": "設計中",
  "source": "world/town/chapel.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "role": "chapel",
  "owner": "町の寄り合い",
  "residents": [],
  "workers": [
    "resident-ベネディクト",
    "resident-クレメンス"
  ],
  "rooms": [
    "room-chapel-hall",
    "room-chapel-records",
    "room-chapel-care"
  ],
  "exterior_parts": [
    "body",
    "tower"
  ],
  "issues": [
    "layout は本堂の内部のみ。鐘塔の床と接続・上り方、戸と柱・梁の立体は未設計",
    "治癒・記録・祈りと粥の受渡し、来訪者と修道士の動線は未照合",
    "鐘と塔の手入れ、暖房・換気・灰・給排水と便所、地形と描画の照合は未完了"
  ],
  "design_dependencies": [
    "map-phanthiet",
    "building-h10",
    "room-chapel-hall",
    "resident-ベネディクト",
    "resident-クレメンス",
    "room-chapel-records",
    "room-chapel-care"
  ],
  "layout": {
    "cell_m": 0.14,
    "width": 70,
    "depth": 40,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-chapel-hall",
          "room-chapel-records",
          "room-chapel-care"
        ]
      }
    ]
  },
  "layout_scope": "main-body"
}
---
# 広場の礼拝堂

## 所有と務め

町の寄り合いが維持し、ベネディクトとクレメンスが女神を祀る小さな礼拝堂を守る。二人の寝床と家庭の台所は [[building-h10]] にあり、礼拝堂を二人の住居として数えない。町の人が祈り、病人やけが人が修道士へ相談する場所、記録を扱う仕事の場所を区別して設計する。

## 現行の外観と入口

現行の描画は本堂と西の鐘塔を持つ。外形と位置、入口は `world/town/chapel.ts` の CHAPEL を参照し、描画と配置検査が同じ定義を使う。本堂だけの矩形に鐘塔を押し込まず、屋根・基壇・控え壁・塔の張出しも別の占有として検査する。南の戸口の前で修道士に会えるが、内部へ入れるゲームの部屋はまだ実装されていない。

## 本堂と鐘塔の設計条件

[[room-chapel-hall]] で祈りと応対を行い、[[room-chapel-records]] と [[room-chapel-care]] を別の戸でつなぐ。寄進で炊く粥の調理場所と受渡し、器の洗浄と回収、火と水をどこへ置くかは未確定である。患者の休む台を住民の普通の寝台として数えない。鐘を鳴らす人が立つ場所と鐘塔の上へ手入れに上がる経路、鐘の振れと灰下ろしを、外観の塔があることだけで成立させない。

外形と既存の入口を共通定義へ出した段階であり、室内の設計・立体や生活の完了ではない。塔頂や墓地の既存の意匠も、女神の世界の生活と合うかを図面と合わせて照合する。


## 本堂の内部の平面案

layout は共通定義の body の外形へ合わせた本堂のみの平面である。西の鐘塔まで内部の設計が済んだことにしない。南の入口から本堂へ入り、記録室と手当ての部屋へは本堂から別々に入る。外壁の占有と内部の仕切り、家具と使う身体をグリッドで持つ。外形の数値を別の値で描画し直す前に、資料と描画の対応を確かめる。
