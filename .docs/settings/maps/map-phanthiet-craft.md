---
{
  "id": "map-phanthiet-craft",
  "kind": "maps",
  "title": "ファンティエット ― 職人通り",
  "status": "現状整理",
  "source": "world/maps/index.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map_id": "phanthiet-craft",
  "map_kind": "town",
  "buildings": [
    "building-armorer",
    "building-woodworker",
    "building-leather",
    "building-h-c1",
    "building-h-c2",
    "building-h-c3",
    "building-h-c4",
    "building-h-c5"
  ],
  "residents": [
    "resident-アントン",
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ",
    "resident-エマ",
    "resident-ニクラス",
    "resident-フリーダ",
    "resident-ローゼマリー",
    "resident-マルクス",
    "resident-カタリーナ",
    "resident-ダニエル",
    "resident-イダ",
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "monsters": [],
  "exits": [
    {
      "at": [
        3,
        47
      ],
      "to": {
        "map": "phanthiet",
        "at": [
          88,
          47
        ]
      }
    },
    {
      "at": [
        16,
        43
      ],
      "to": {
        "map": "phanthiet-in-armorer",
        "at": [
          48,
          53
        ]
      }
    },
    {
      "at": [
        29,
        43
      ],
      "to": {
        "map": "phanthiet-in-woodworker",
        "at": [
          48,
          53
        ]
      }
    },
    {
      "at": [
        54,
        43
      ],
      "to": {
        "map": "phanthiet-in-leather",
        "at": [
          48,
          52
        ]
      }
    },
    {
      "at": [
        16,
        50
      ],
      "to": {
        "map": "phanthiet-in-h-c2",
        "at": [
          48,
          52
        ]
      }
    }
  ],
  "issues": [
    "生活・物流の経路と出入口のグリッド照合未完了",
    "描画と通行判定の一致確認未完了"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "building-armorer",
    "building-woodworker",
    "building-leather",
    "building-h-c1",
    "building-h-c2",
    "building-h-c3",
    "building-h-c4",
    "building-h-c5",
    "facility-craft-forge"
  ],
  "facilities": [
    "facility-craft-forge"
  ]
}
---
# ファンティエット ― 職人通り

## 場所の役割

ファンティエット ― 職人通りは町の地区である。周囲とのつながりはメタデータの exits を持つ。出入口は通行のための場所であり、別の目的地への経路の途中で意図せず踏ませない。

## 使う人と物の流れ

地区の建物は[[building-armorer]]、[[building-woodworker]]、[[building-leather]]、[[building-h-c1]]、[[building-h-c2]]、[[building-h-c3]]、[[building-h-c4]]、[[building-h-c5]]。各建物の入口から仕事・水汲み・食事・帰宅の経路をつなぐ。

## 生き物との関係

モンスターの出現は登録されていない。

## 配置の設計条件

入口、主な通路、作業と休憩の場所を先に配列で定義する。建物の外周と扉、荷の大きさ、人がすれ違う幅を合わせ、装飾を置いてから通路を残す順序にしない。灰・雨・煙・火・水の行き先を決める。現行の通行格子は現状の記録であり、生活の成立を承認した配置図ではない。
