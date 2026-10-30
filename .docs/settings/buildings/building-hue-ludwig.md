---
{
  "id": "building-hue-ludwig",
  "kind": "buildings",
  "title": "ルードヴィヒの住まいの案",
  "status": "設計中",
  "source": ".docs/settings/towns/town-hue.md",
  "design_gate": "未通過",
  "town": "town-hue",
  "implementation": "未実装の設計案",
  "map": "map-hue-quarter",
  "household": "hue-ludwig",
  "residents": [
    "resident-ルードヴィヒ"
  ],
  "workers": [],
  "rooms": [
    "room-hue-ludwig-2",
    "room-hue-ludwig-1",
    "room-hue-ludwig-hall",
    "room-hue-ludwig-wash",
    "room-hue-ludwig-toilet",
    "room-hue-ludwig-fuel"
  ],
  "proposed_district": "H",
  "issues": [
    "単層の共通座標と六室の平面案。敷地と地形・屋根と梁・基礎の耐力と入口の段差は未照合",
    "各家具と戸の立体・身体、熱と換気、食料と水・灰と汚水と日課は未設計",
    "地形は未割当で、基礎・床と天井の高さ、外部との段差は未決"
  ],
  "design_dependencies": [
    "town-hue",
    "map-hue-quarter",
    "room-hue-ludwig-1",
    "room-hue-ludwig-2",
    "resident-ルードヴィヒ",
    "room-hue-ludwig-hall",
    "room-hue-ludwig-wash",
    "room-hue-ludwig-toilet",
    "room-hue-ludwig-fuel"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 20,
    "depth": 17,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-hue-ludwig-2",
          "room-hue-ludwig-1",
          "room-hue-ludwig-hall",
          "room-hue-ludwig-wash",
          "room-hue-ludwig-toilet",
          "room-hue-ludwig-fuel"
        ]
      }
    ]
  },
  "district_reservation": {
    "scope": "unplaced_town_district",
    "status": "proposed",
    "at_m": [
      1,
      1
    ],
    "clearance_m": 1
  },
  "door_leaf_inventory": [
    {
      "room": "room-hue-ludwig-2",
      "door": [
        3,
        6
      ]
    },
    {
      "room": "room-hue-ludwig-1",
      "door": [
        3,
        6
      ]
    },
    {
      "room": "room-hue-ludwig-hall",
      "door": [
        0,
        1
      ]
    },
    {
      "room": "room-hue-ludwig-wash",
      "door": [
        3,
        0
      ]
    },
    {
      "room": "room-hue-ludwig-toilet",
      "door": [
        3,
        0
      ]
    },
    {
      "room": "room-hue-ludwig-fuel",
      "door": [
        3,
        0
      ]
    },
    {
      "room": "room-hue-ludwig-fuel",
      "door": [
        7,
        3
      ]
    }
  ]
}
---
# ルードヴィヒの住まいの案

## 世帯と仕事場の区別

[[resident-ルードヴィヒ]] が一人で暮らす住まいの案である。工房で働くことを、その工房の隅で眠り食べる理由にしない。住宅の候補は [[town-hue#未配置の区画案]] の H とし、機関の修繕の候補 W とは別の場所にする。単層の平面を共通座標で割り当てた案であり、敷地への原点と向き、屋根と梁・基礎の耐力は未設計である。

## 家で使う室

[[room-hue-ludwig-1]] を食事と調理・休息、[[room-hue-ludwig-2]] を本人の寝床と個人収納へ割り当てる。[[room-hue-ludwig-hall]] から、[[room-hue-ludwig-wash]] の衣服の手入れと室内干し、[[room-hue-ludwig-toilet]] の便所と手洗い、[[room-hue-ludwig-fuel]] の燃料と冷えた灰の保管へ通じる。平面の用途を分けた段階であり、各物の量と供給・身体と日課の成立はまだ照合していない。

## 工房との往復

仕事の前後に食べ、身支度をし、仕事着と道具を手入れし、帰宅して休み眠る。修繕の受付と作業、部品の受渡しの時間を決める際に家事を消さない。仕事場の全室と経路、供給・廃棄物の量と身体、敷地と構造が未設計のため、住まいを現行の町へ追加しない。


## 六室の共通座標の案

北側に本人の寝間と食事・調理・休息の室、中央に入口と廊下、南側に衣服の手入れと室内干し・便所と手洗い・燃料と冷えた灰の室を置く。各室は境界の壁と同じ戸口を共有し、便所や燃料を扱うために食卓と寝床を通らない。部屋の出入口は別の資料へ双方向で記録する。

これは床の占有と通路の案であり、炉と煙道、熱と換気、戸の開閉と屋外の段差、灰と汚水・排泄物の搬出、家具の立体と物の容量・身体と一日は未照合である。住まいを実行時に追加せず、全室が同じ図へ収まったことを生活設計の完了としない。


## 区画内の土地の予約案

都市の H の局所の区画へ、建物の全平面と周囲の通行の余地を一つの予約として置く。位置は区画の左上からの相対位置であり、都市や門前へ割り当てた敷地ではない。周囲の余地を別の住まいの床や同じ土地の二重の予約へ使わない。

予約は平面の土地の取り分であり、屋根の張出しと煙突・雨と灰の処理、地形と入口の段差、門前からの道と荷の搬入出、他の区画への経路は未照合である。区画内に収まることを実際の敷地や生活の成立としない。


## 戸口と扉を持つ室

室内の共有する戸口は一方の室だけに板を持たせる。寝間・食事と調理の室・衣服の手入れ・便所・燃料と灰の室へ内開きとし、廊下側へ別の板を重ねない。外の入口は廊下、搬入出の外の戸は燃料と灰の室が持つ。door_leaf_inventory はこの所有を一棟で照合するための対応である。

燃料と灰の室の専用の道具は占有の大きさを保って移し、内側と外側の扉の回転域を空ける。順序を持つ使用面と家具本体の占有は分け、板が当たる家具を待ち時間で免除しない。身体による操作と開いた板を避ける通路、上下の立体と金具・枠は引き続き未設計である。


## 開いた扉を避ける通行の案

各室は、全ての板を開き切った状態で、各戸口の室内側から室内の共通の通過点までつなぐ。通過する円の幅は設計の下限を下回らず、家具・壁と板厚・金具を残した全区間を照合する。戸口の板を消した格子だけでは判定しない。

食事の室では蝶番側を変え、燃料と灰の室は幅を拡げて、家具の大きさと周囲の予約の幅を保つ。北の室と廊下も同じ外周へ合わせ、一棟の平面を欠けさせない。局所の土地の予約の内側へ収め、通行を作るために道や別の区画へはみ出さない。

これは静的な開位置の平面の通過の案であり、本人の描画する身体・衣服と荷物、戸を開閉する操作、各使用面へ移り作業する全ての段階を保証しない。水を取り出す使用面などは戸を閉じてから使う順序も含めて続けて設計する。
