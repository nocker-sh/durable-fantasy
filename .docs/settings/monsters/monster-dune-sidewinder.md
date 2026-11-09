---
{
  "id": "monster-dune-sidewinder",
  "kind": "monsters",
  "title": "横這いへび",
  "status": "設計中",
  "source": "apps/main/world/core/monsters.ts",
  "design_gate": "未通過",
  "species": "dune-sidewinder",
  "habitats": [
    "map-red-dunes"
  ],
  "appearance": {
    "look": "model",
    "color": null,
    "size": null,
    "shape_source": "apps/main/world/core/bestiary/dune-sidewinder.ts",
    "footprint_source": "apps/main/world/core/get-monster-body-radius.ts",
    "movement_clearance": "walk_grid_adopted"
  },
  "issues": [
    "生息地の水・餌・休息地と出現範囲のグリッド照合未完了",
    "行動と人の仕事・通路の干渉確認未完了",
    "休息・採食・警戒・退避の描画と実装は未照合"
  ],
  "ecology": {
    "diet": "夕方から砂の上で探すねずみや虫",
    "water": "獲物の体の水と、風陰の根元に残る湿り",
    "rest": "昼は岩陰の砂に浅く潜る",
    "social": "岩陰ごとに一匹ずつ使う。出現枠を全個体数とは扱わない",
    "human_contact": "人の足音が伝わると砂へ潜る。残骸を調べる人の通り道には出ない",
    "reaction": "叩かれるとその場で鎌首を上げて噛み返す。離れた相手は追わない"
  },
  "materials": [
    {
      "item": "raw-hide",
      "origin": "脱皮で砂に残る皮",
      "users": [
        "resident-ルドルフ"
      ],
      "use": "革工房でなめして革の装備にする"
    },
    {
      "item": "sharp-fang",
      "origin": "岩に当てて欠けた牙の先",
      "users": [
        "resident-ルドルフ"
      ],
      "use": "仕立て仕事でお守りに加工する"
    }
  ],
  "population": {
    "unit": "出現枠は野外で出会う代表個体。地域の全個体数ではない",
    "return": "再出現の秒数はゲームの復帰規則であり、繁殖や成長の所要時間ではない",
    "unresolved": "繁殖・季節変化・個体の入れ替わりの表現は未設計"
  },
  "design_dependencies": [
    "map-red-dunes",
    "resident-ルドルフ"
  ]
}
---

# 横這いへび

## 暮らし

昼は岩陰の砂に浅く潜って過ごし、夕方から砂の上を横向きに這ってねずみや虫を探す。人の足音が伝わると砂へ潜る。大戦で熱い砂地を越えて知らせを運んだ細長い生き物の子孫で、熱を逃がす背の小さな板と目の上の庇が残った。生き物の形と調整は `apps/main/world/core/bestiary/dune-sidewinder.ts` にある。生息地は [[map-red-dunes]] に置く。

## 人との接点

出現枠は砂丘の南西と南東の岩陰に置き、人の通り道と出口を塞がない。反撃と離脱は [[game-system#8. 戦闘]] に従う。

## 配置と未照合

出現矩形は `apps/main/world/core/monsters.ts` に置く。餌・水・休息地の実地形への割当てと、人の仕事の床との照合は残り、出現枠を置いたことを生息地の設計完了とは扱わない。
