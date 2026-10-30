---
{
  "id": "map-phanthiet-gate",
  "kind": "maps",
  "title": "ファンティエット ― 南門",
  "status": "現状整理",
  "source": "world/maps/index.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map_id": "phanthiet-gate",
  "map_kind": "town",
  "buildings": [
    "building-warehouse",
    "building-guardhouse",
    "building-h-g1",
    "building-h-g2",
    "building-h-g4",
    "building-h-g5",
    "building-h-g6",
    "building-h-g3"
  ],
  "residents": [
    "resident-オイゲン",
    "resident-テオ",
    "resident-シュテファン",
    "resident-ヴェロニカ",
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ",
    "resident-ファルク",
    "resident-ブリギッテ",
    "resident-ロルフ",
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン",
    "resident-エドガー",
    "resident-マルグリット"
  ],
  "monsters": [],
  "exits": [
    {
      "at": [
        38,
        3
      ],
      "to": {
        "map": "phanthiet",
        "at": [
          38,
          88
        ]
      }
    },
    {
      "at": [
        48,
        93
      ],
      "to": {
        "map": "south-meadow",
        "at": [
          48,
          8
        ]
      }
    },
    {
      "at": [
        61,
        28
      ],
      "to": {
        "map": "phanthiet-in-warehouse",
        "at": [
          48,
          53
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
    "building-warehouse",
    "building-guardhouse",
    "building-h-g1",
    "building-h-g2",
    "building-h-g4",
    "building-h-g5",
    "building-h-g6",
    "building-h-g3"
  ]
}
---

# ファンティエット ― 南門

## 場所の役割

ファンティエット ― 南門は町の地区である。周囲とのつながりはメタデータの exits を持つ。出入口は通行のための場所であり、別の目的地への経路の途中で意図せず踏ませない。

## 使う人と物の流れ

地区の建物は[[building-warehouse]]、[[building-guardhouse]]、[[building-h-g1]]、[[building-h-g2]]、[[building-h-g4]]、[[building-h-g5]]、[[building-h-g6]]、[[building-h-g3]]。各建物の入口から仕事・水汲み・食事・帰宅の経路をつなぐ。

## 生き物との関係

モンスターの出現は登録されていない。

## 配置の設計条件

入口、主な通路、作業と休憩の場所を先に配列で定義する。建物の外周と扉、荷の大きさ、人がすれ違う幅を合わせ、装飾を置いてから通路を残す順序にしない。灰・雨・煙・火・水の行き先を決める。現行の通行格子は現状の記録であり、生活の成立を承認した配置図ではない。
