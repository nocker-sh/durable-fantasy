---
{
  "id": "map-forest-edge",
  "kind": "maps",
  "title": "樹海の入り口",
  "status": "設計中",
  "source": "world/maps/index.ts",
  "design_gate": "未通過",
  "town": null,
  "map_id": "forest-edge",
  "map_kind": "field",
  "buildings": [],
  "residents": [],
  "monsters": [
    "monster-blue-slime",
    "monster-hare",
    "monster-ash-hare"
  ],
  "exits": [
    {
      "at": [
        48,
        3
      ],
      "to": {
        "map": "deep-forest",
        "at": [
          48,
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
        "map": "net-sheds",
        "at": [
          48,
          8
        ]
      }
    },
    {
      "at": [
        3,
        52
      ],
      "to": {
        "map": "south-meadow",
        "at": [
          88,
          52
        ]
      }
    }
  ],
  "issues": [
    "生活・物流の経路と出入口のグリッド照合未完了",
    "描画と通行判定の一致確認未完了",
    "生息種ごとの餌・水・休息地と、人の作業面・退避経路の配置未確定"
  ],
  "ecology_zones": [
    {
      "species": "monster-blue-slime",
      "feature": "炭焼きの火と離れた湿った根元",
      "placement": null
    },
    {
      "species": "monster-hare",
      "feature": "林縁の草と退避できる低木",
      "placement": null
    },
    {
      "species": "monster-ash-hare",
      "feature": "灰の溜まる根元と木の芽がある縁",
      "placement": null
    }
  ],
  "design_dependencies": [
    "monster-blue-slime",
    "monster-hare",
    "monster-ash-hare"
  ]
}
---

# 樹海の入り口

## 場所の役割

樹海の入り口は町の外の場所である。周囲とのつながりはメタデータの exits を持つ。出入口は通行のための場所であり、別の目的地への経路の途中で意図せず踏ませない。

## 使う人と物の流れ

建物の所属資料と照合し、管理する人とここへ来る目的を確定する。

## 生き物との関係

現在の生息種は[[monster-blue-slime]]、[[monster-hare]]、[[monster-ash-hare]]。人の通る道、採集する場所、生き物の居場所を同じ配置図で確認する。

## 配置の設計条件

入口、主な通路、作業と休憩の場所を先に配列で定義する。建物の外周と扉、荷の大きさ、人がすれ違う幅を合わせ、装飾を置いてから通路を残す順序にしない。灰・雨・煙・火・水の行き先を決める。現行の通行格子は現状の記録であり、生活の成立を承認した配置図ではない。

## 木こりの仕事場と林縁の生き物をつなぐ

ヨーゼフの炭焼きと原木の搬出がある。薪・炭の乾いた保管、火を扱う床、生き物の水と休息場所を分ける。野うさぎと灰うさぎは現在、同じ範囲に出現枠を持つ。別々の地形に配置済みという説明はせず、同じ林縁を使う場面と退く先を設計する。道からの見え方だけでなく、採集する人が木を倒す方向と生き物の休息場所も照合する。

生息条件は ecology_zones に記録する。placement が null の条件はまだ地形に割り当てていない。出現矩形があることだけで、その条件を満たした配置としない。
