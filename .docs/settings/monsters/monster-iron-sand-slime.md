---
{
  "id": "monster-iron-sand-slime",
  "kind": "monsters",
  "title": "鉄砂スライム",
  "status": "設計中",
  "source": "apps/main/world/core/monsters.ts",
  "design_gate": "未通過",
  "species": "iron-sand-slime",
  "habitats": [
    "map-red-dunes"
  ],
  "appearance": {
    "look": "slime",
    "color": 8548446,
    "size": 1.35,
    "shape_source": "apps/main/world/core/monster-body-shapes.ts",
    "footprint_source": "apps/main/world/core/get-monster-body-radius.ts",
    "movement_clearance": "walk_grid_adopted"
  },
  "issues": [
    "生息地の水・餌・休息地と出現範囲のグリッド照合未完了",
    "行動と人の仕事・通路の干渉確認未完了",
    "休息・採食・警戒・退避の描画と実装は未照合"
  ],
  "ecology": {
    "diet": "砂丘の風下に残る植物片",
    "water": "砂スライムと同じ風陰の湿り",
    "rest": "砂が堅く締まった残骸の外側",
    "social": "餌と休息地を小さく分け合う。出現枠を全個体数とは扱わない",
    "human_contact": "素材を集めに来る人と出会う。出口と通り道を占拠せず、こちらからは襲わない",
    "reaction": "叩かれるとその位置で体を縮めて押し返す。離脱した相手を追わない"
  },
  "materials": [
    {
      "item": "hardened-scrap",
      "origin": "体表からはがれた厚い鉄片",
      "users": [
        "resident-アルノルト"
      ],
      "use": "町の職人が装備または水薬に加工する。加工先は apps/main/world/core/recipes/hunting-recipes.ts"
    },
    {
      "item": "rusty-scrap",
      "origin": "体表へ付いた小さな鉄くず",
      "users": [
        "resident-アルノルト"
      ],
      "use": "既存の素材または狩りの装備の加工に使う。加工先はレシピの定義に従う"
    },
    {
      "item": "herb",
      "origin": "風陰の草から体表へ付いた薬草",
      "users": [
        "resident-イルムガルト"
      ],
      "use": "既存の素材または狩りの装備の加工に使う。加工先はレシピの定義に従う"
    }
  ],
  "population": {
    "unit": "出現枠は野外で出会う代表個体。地域の全個体数ではない",
    "return": "再出現の秒数はゲームの復帰規則であり、繁殖や成長の所要時間ではない",
    "unresolved": "繁殖・季節変化・個体の入れ替わりの表現は未設計"
  },
  "design_dependencies": [
    "map-red-dunes",
    "resident-アルノルト",
    "resident-イルムガルト"
  ]
}
---

# 鉄砂スライム

## 食べ物と水

砂丘の風下に残る植物片を食べ、砂スライムと同じ風陰の湿りから水分を得る。外皮へ重い鉄片が付いた個体。鉄を食べず、植物片を餌にする。

## 休息と人との接点

砂が堅く締まった残骸の外側で休む。生息地は [[map-red-dunes]] に置き、既存の通行可能な縄張りを使う。採集や残骸を調べる人が立ち寄る場所で出会い、通常の通路や出口に待ち伏せさせない。反撃と離脱は [[game-system#8. 戦闘]] に従う。

## 材料と加工

主な新素材の由来と使い手は [[hardened-scrap]] にある。

体表からはがれた厚い鉄片を集め、[[resident-アルノルト]] に持ち込む。hardened-scrap の量、価格と加工の条件はコードを正とする。装備を直接落とさず、職人の仕事を通して狩りの成果を次の装備へつなぐ。

## 配置と未照合

出現矩形は `apps/main/world/core/monsters.ts` に置き、身体を含む通行格子との照合を行う。新しいマップを自動生成せず、砂丘または樹海の既存の縄張り内で配置する。餌、水、休息地の実地形への割当てと、人の仕事の床との照合は生息マップとともに残し、資料の作成や戦闘の検査をマップ全体の設計完了とは扱わない。
