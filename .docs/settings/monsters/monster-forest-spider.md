---
{
  "id": "monster-forest-spider",
  "kind": "monsters",
  "title": "樹海ぐも",
  "status": "設計中",
  "source": "apps/main/world/core/monsters.ts",
  "design_gate": "未通過",
  "species": "forest-spider",
  "habitats": [
    "map-deep-forest"
  ],
  "appearance": {
    "look": "model",
    "color": null,
    "size": null,
    "shape_source": "apps/main/world/core/bestiary/forest-spider.ts",
    "footprint_source": "apps/main/world/core/get-monster-body-radius.ts",
    "movement_clearance": "walk_grid_adopted"
  },
  "issues": [
    "生息地の水・餌・休息地と出現範囲のグリッド照合未完了",
    "行動と人の仕事・通路の干渉確認未完了",
    "休息・採食・警戒・退避の描画と実装は未照合"
  ],
  "ecology": {
    "diet": "夜に枝から落ちてくる虫",
    "water": "倒木の根元に溜まる雨水と朝露",
    "rest": "倒木の根元の穴に糸で袋を張って昼を過ごす",
    "social": "倒木ごとに一匹ずつ巣を持つ。出現枠を全個体数とは扱わない",
    "human_contact": "人が近づくと脚をたたんで穴へ下がる。通り道には巣を張らない",
    "reaction": "叩かれるとその場で脚を広げて噛み返す。離れた相手は追わない"
  },
  "materials": [
    {
      "item": "sticky-thread",
      "origin": "巣の袋から引き出した糸",
      "users": [
        "resident-ラインホルト"
      ],
      "use": "買取屋が引き取る。仕立ての使い道は未設計"
    },
    {
      "item": "hard-shell",
      "origin": "脱皮で落ちた背の硬い板",
      "users": [
        "resident-ラインホルト"
      ],
      "use": "買取屋が引き取る。加工の使い道は未設計"
    }
  ],
  "population": {
    "unit": "出現枠は野外で出会う代表個体。地域の全個体数ではない",
    "return": "再出現の秒数はゲームの復帰規則であり、繁殖や成長の所要時間ではない",
    "unresolved": "繁殖・季節変化・個体の入れ替わりの表現は未設計"
  },
  "design_dependencies": [
    "map-deep-forest",
    "resident-ラインホルト"
  ]
}
---

# 樹海ぐも

## 暮らし

倒木の根元の穴に糸で袋を張って昼を過ごし、夜に枝から落ちてくる虫を待って食べる。人が近づくと脚をたたんで穴へ下がる。大戦で木や壁を登って見張りをした大きな蜘蛛の子孫で、背の硬い板と尻の太い二本の糸管が今も体に比べて大きい。生き物の形と調整は `apps/main/world/core/bestiary/forest-spider.ts` にある。生息地は [[map-deep-forest]] に置く。

## 人との接点

出現枠は倒木の残る北東と南の根元に置き、人の通り道と出口を塞がない。反撃と離脱は [[game-system#8. 戦闘]] に従う。

## 配置と未照合

出現矩形は `apps/main/world/core/monsters.ts` に置く。餌・水・休息地の実地形への割当てと、人の仕事の床との照合は残り、出現枠を置いたことを生息地の設計完了とは扱わない。
