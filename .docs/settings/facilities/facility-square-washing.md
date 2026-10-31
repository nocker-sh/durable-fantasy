---
{
  "id": "facility-square-washing",
  "kind": "facilities",
  "title": "川沿いの共同洗濯場",
  "status": "設計中",
  "source": "world/maps/index.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "site": {
    "map": "map-phanthiet",
    "place": "lavoir1"
  },
  "users": [
    "resident-アンナ",
    "resident-クララ",
    "resident-エルザ"
  ],
  "purpose": "川沿いで衣服を洗い、持ち帰るために水を切る作業場所",
  "issues": [
    "設備と待機・運搬場所の敷地グリッド未設計",
    "管理する住民と維持の日課の照合未完了",
    "階段の底面の反転は修正。地形の斜面と踏面・端部、踊り場と手摺・籠の幅・濡れた足場は未照合"
  ],
  "design_dependencies": [
    "map-phanthiet",
    "resident-アンナ",
    "resident-クララ",
    "resident-エルザ"
  ],
  "geometry_source": "world/scene/construction/waterworks.ts",
  "terrain_source": "world/maps/ground/create-ground-fields.ts"
}
---

# 川沿いの共同洗濯場

## 用途と使い手

三人の洗濯仕事が使う場所を、洗う場所、すすぐ場所、清潔な物を籠へ入れる場所に分ける。川へ落ちる足場や、子どもの遊びと熱い湯を運ぶ経路の重なりを避ける。

洗った物は各世帯へ持ち帰り、屋内の縄に干す。川辺や商店通りの屋外に洗濯物を干さない。晴れていても灰が降るという [[world#気候と灰]] の条件を変えない。川の上下流、取水、汚水の合流先は未確定であり、この地点を飲用水の取水場として兼用しない。

## 東岸からの来訪と上の踊り場

[[resident-アンナ]] の敷地案から既存の橋を通る経路は、洗濯場の階段の上端までとする。上端の位置と幅は `world/maps/layout.ts` の lavStairs を正とする。到着した身体が、洗濯の作業足場へ降り、籠を置いて洗えることは別の設計を要する。経路の資料を、設備の作業グリッドと階段・手摺・取水と汚水、維持の日課の代わりにしない。

## 階段の描画と地形

段数と踏面の描画は geometry_source、作業足場と上の地面の高さは terrain_source と `world/maps/layout.ts` を参照する。上り向きに段を作る場合も、各段の底面は最低の踏面より下に置く。上端の高さを底面の基準へ使うと下段の箱が反転するため、共通の段の計算で上下方向を区別せず成立させる。

この修正は階段の形の破綻を直すものであり、荷物を持つ人の昇降を確認した意味ではない。地形の補間した斜面と段の端、上と下の踊り場、手摺と濡れた石、洗濯籠の取手と重さ、すれ違う人を立体で照合する。現行の狭い足場へ三人の道具と籠を無条件に並べない。
