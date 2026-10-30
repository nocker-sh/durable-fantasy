---
{
  "id": "map-phanthiet-market",
  "kind": "maps",
  "title": "ファンティエット ― 商店通り",
  "status": "現状整理",
  "source": "world/maps/index.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map_id": "phanthiet-market",
  "map_kind": "town",
  "buildings": [
    "building-tavern",
    "building-apothecary",
    "building-general",
    "building-tailor",
    "building-crystal",
    "building-h-m1",
    "building-buyer",
    "building-h-m2",
    "building-h-m3",
    "building-h-m4",
    "building-h-m5"
  ],
  "residents": [
    "resident-エミール",
    "resident-フェルディナント",
    "resident-マックス",
    "resident-カスパー",
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ",
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "monsters": [],
  "exits": [
    {
      "at": [
        93,
        50
      ],
      "to": {
        "map": "phanthiet",
        "at": [
          8,
          50
        ]
      }
    },
    {
      "at": [
        12,
        44
      ],
      "to": {
        "map": "phanthiet-in-tavern",
        "at": [
          48,
          53
        ]
      }
    },
    {
      "at": [
        23,
        44
      ],
      "to": {
        "map": "phanthiet-in-apothecary",
        "at": [
          48,
          52
        ]
      }
    },
    {
      "at": [
        34,
        44
      ],
      "to": {
        "map": "phanthiet-in-general",
        "at": [
          48,
          52
        ]
      }
    },
    {
      "at": [
        61,
        44
      ],
      "to": {
        "map": "phanthiet-in-tailor",
        "at": [
          48,
          53
        ]
      }
    },
    {
      "at": [
        72,
        44
      ],
      "to": {
        "map": "phanthiet-in-crystal",
        "at": [
          48,
          52
        ]
      }
    },
    {
      "at": [
        11,
        52
      ],
      "to": {
        "map": "phanthiet-in-buyer",
        "at": [
          48,
          52
        ]
      }
    },
    {
      "at": [
        84,
        52
      ],
      "to": {
        "map": "phanthiet-in-h-m5",
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
    "building-tavern",
    "building-apothecary",
    "building-general",
    "building-tailor",
    "building-crystal",
    "building-h-m1",
    "building-buyer",
    "building-h-m2",
    "building-h-m3",
    "building-h-m4",
    "building-h-m5"
  ]
}
---

# ファンティエット ― 商店通り

## 場所の役割

ファンティエット ― 商店通りは町の地区である。周囲とのつながりはメタデータの exits を持つ。出入口は通行のための場所であり、別の目的地への経路の途中で意図せず踏ませない。

## 使う人と物の流れ

地区の建物は[[building-tavern]]、[[building-apothecary]]、[[building-general]]、[[building-tailor]]、[[building-crystal]]、[[building-h-m1]]、[[building-buyer]]、[[building-h-m2]]、[[building-h-m3]]、[[building-h-m4]]、[[building-h-m5]]。各建物の入口から仕事・水汲み・食事・帰宅の経路をつなぐ。

## 生き物との関係

モンスターの出現は登録されていない。

## 配置の設計条件

入口、主な通路、作業と休憩の場所を先に配列で定義する。建物の外周と扉、荷の大きさ、人がすれ違う幅を合わせ、装飾を置いてから通路を残す順序にしない。灰・雨・煙・火・水の行き先を決める。現行の通行格子は現状の記録であり、生活の成立を承認した配置図ではない。
