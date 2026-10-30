---
{
  "id": "map-phanthiet",
  "kind": "maps",
  "title": "ファンティエット ― 広場",
  "status": "設計中",
  "source": "world/maps/index.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map_id": "phanthiet",
  "map_kind": "town",
  "buildings": [
    "building-bakery",
    "building-h1",
    "building-h2",
    "building-inn",
    "building-h3",
    "building-h4",
    "building-h5",
    "building-h6",
    "building-h7",
    "building-h8",
    "building-smithy",
    "building-h9",
    "building-h10",
    "building-barn",
    "building-farmhouse",
    "building-coop",
    "building-chapel"
  ],
  "residents": [
    "resident-ギュンター",
    "resident-ペーター",
    "resident-ハンス",
    "resident-リーゼル",
    "resident-アンナ",
    "resident-クララ",
    "resident-エルザ",
    "resident-オットー",
    "resident-グレーテ",
    "resident-ヤコブ",
    "resident-フリッツ",
    "resident-ミア",
    "resident-ヴィルヘルム",
    "resident-ヨーゼフ",
    "resident-ウルリケ",
    "resident-カール",
    "resident-マティアス",
    "resident-ベネディクト",
    "resident-ディーター",
    "resident-ゾフィー",
    "resident-ベルタ",
    "resident-ルカス",
    "resident-ローザ",
    "resident-ゲルトルート",
    "resident-ヴァルター",
    "resident-クレメンス",
    "resident-パウル",
    "resident-レナ",
    "resident-ヨナス",
    "resident-アウグスト",
    "resident-ヘートヴィヒ",
    "resident-ティム"
  ],
  "monsters": [],
  "exits": [
    {
      "at": [
        93,
        47
      ],
      "to": {
        "map": "phanthiet-craft",
        "at": [
          8,
          47
        ]
      }
    },
    {
      "at": [
        38,
        93
      ],
      "to": {
        "map": "phanthiet-gate",
        "at": [
          38,
          8
        ]
      }
    },
    {
      "at": [
        3,
        50
      ],
      "to": {
        "map": "phanthiet-market",
        "at": [
          88,
          50
        ]
      }
    },
    {
      "at": [
        29,
        41
      ],
      "to": {
        "map": "phanthiet-in-bakery",
        "at": [
          48,
          52
        ]
      }
    },
    {
      "at": [
        48,
        55
      ],
      "to": {
        "map": "phanthiet-in-inn",
        "at": [
          48,
          52
        ]
      }
    }
  ],
  "issues": [
    "生活・物流の経路と出入口のグリッド照合未完了",
    "描画と通行判定の一致確認未完了",
    "納屋と同時に付け替える道の路面・排水・補修、牧草地の柵の入口と路肩・橋と荷重・日課は未照合"
  ],
  "facilities": [
    "facility-square-well",
    "facility-square-washing",
    "facility-bakery-oven",
    "facility-h8-privy",
    "facility-h8-treatment",
    "facility-h8-nonfood-plot",
    "facility-h7-garden",
    "facility-h6-garden",
    "facility-h4-garden",
    "facility-h7-wool-preparation",
    "facility-square-pasture",
    "facility-square-windmill"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "building-bakery",
    "building-h1",
    "building-h2",
    "building-inn",
    "building-h3",
    "building-h4",
    "building-h5",
    "building-h6",
    "building-h7",
    "building-h8",
    "building-smithy",
    "building-h9",
    "building-h10",
    "building-barn",
    "building-farmhouse",
    "building-coop",
    "facility-square-well",
    "facility-square-washing",
    "facility-bakery-oven",
    "facility-h8-privy",
    "facility-h8-treatment",
    "facility-h8-nonfood-plot",
    "facility-h7-garden",
    "facility-h6-garden",
    "facility-h4-garden",
    "building-chapel",
    "facility-h7-wool-preparation",
    "facility-square-pasture",
    "facility-square-windmill"
  ],
  "road_plan": {
    "status": "proposed",
    "changes": [
      {
        "source_index": 3,
        "source_start": [
          34,
          22
        ],
        "source_end": [
          50,
          23
        ],
        "points_tiles": [
          [
            34,
            22
          ],
          [
            37,
            22.4
          ],
          [
            39,
            24.75
          ],
          [
            47.9,
            24.75
          ],
          [
            50,
            23
          ]
        ],
        "start": {
          "kind": "preserved"
        },
        "end": {
          "kind": "preserved"
        },
        "purpose": "東へ抜ける通りを納屋の南へ回す。橋側と東の行先は保つ"
      },
      {
        "source_index": 7,
        "source_start": [
          40,
          23.5
        ],
        "source_end": [
          41.5,
          18.6
        ],
        "points_tiles": [
          [
            37.2,
            15
          ],
          [
            39.5,
            15
          ],
          [
            39.5,
            16.978571428571428
          ]
        ],
        "start": {
          "kind": "road",
          "source_index": 8
        },
        "end": {
          "kind": "building",
          "building": "building-barn"
        },
        "purpose": "納屋の干し草の戸への枝道を、北西の既存の道へ接続する"
      },
      {
        "source_index": 9,
        "source_start": [
          40.5,
          23.6
        ],
        "source_end": [
          42,
          30.5
        ],
        "points_tiles": [
          [
            41.2,
            24.75
          ],
          [
            41.2,
            29.9
          ],
          [
            40.91428571428572,
            29.9
          ],
          [
            40.91428571428572,
            31.97142857142857
          ]
        ],
        "start": {
          "kind": "road",
          "source_index": 3
        },
        "end": {
          "kind": "stock_lock",
          "facility": "facility-square-pasture"
        },
        "purpose": "牧草地の北西を前室へ分ける候補に合わせ、道幅を保って外の操作床へ接続する"
      }
    ]
  }
}
---
# ファンティエット ― 広場

## 場所の役割

ファンティエット ― 広場は町の地区である。周囲とのつながりはメタデータの exits を持つ。出入口は通行のための場所であり、別の目的地への経路の途中で意図せず踏ませない。

## 使う人と物の流れ

地区の建物は[[building-bakery]]、[[building-h1]]、[[building-h2]]、[[building-inn]]、[[building-h3]]、[[building-h4]]、[[building-h5]]、[[building-h6]]、[[building-h7]]、[[building-h8]]、[[building-smithy]]、[[building-h9]]、[[building-h10]]、[[building-barn]]、[[building-farmhouse]]、[[building-coop]]。各建物の入口から仕事・水汲み・食事・帰宅の経路をつなぐ。

## 生き物との関係

モンスターの出現は登録されていない。

## 配置の設計条件

入口、主な通路、作業と休憩の場所を先に配列で定義する。建物の外周と扉、荷の大きさ、人がすれ違う幅を合わせ、装飾を置いてから通路を残す順序にしない。灰・雨・煙・火・水の行き先を決める。現行の通行格子は現状の記録であり、生活の成立を承認した配置図ではない。

## 水と仕事の場所

[[facility-square-well]] の汲み場、[[facility-square-washing]] の作業面、[[facility-bakery-oven]] の火口と運搬の経路を別々に持つ。食品、熱い物、濡れた物、灰を同じ待機場所へ重ねない。川の上下流と地形、屋外窯と隣家の離隔は今後の敷地グリッドに含める。

## 庭と家の配置案

家庭菜園は [[facility-h7-garden]]・[[facility-h6-garden]]・[[facility-h4-garden]] を参照する。家を実寸へ広げた際に庭と通路を潰さないよう、庭の元の対象と新しい占有を分けて持つ。地上の面積を維持して提案するが、日課と畝・柵・水・季節の照合、実際の地面と描画の切替はまだ行っていない。

## 広場の南と東岸の敷地案

[[building-inn]] は広場へ北から拡張せず南の通りの南へ、[[building-h5]] は牧草地の西・農家の北の東岸へ移す案を持つ。二つの位置と入口は各建物の site_plan を正とし、ここへ数値を写さない。宿の敷地は姉妹の家の移設が前提である。広場と既存の橋を残し、畑・牧草地・豚の囲い、庭と生活設備を住宅に置き換えない。

この案は現行の町と日課へ未反映である。姉妹の家から野菜の受取りと橋を通る洗濯仕事への往復、宿への客と物資の到着、広場の滞在・通過・設備の利用を地形・段差と一緒に照合してから描画する。


## 羊毛の手入れ場の未配置の案

[[facility-h7-wool-preparation]] の設備は敷地をまだ割り当てていない案であり、現行の町や家庭の室内へ採用していない。処理用水と汚水の一時保管、羊の世話と家の仕事・受渡しを、敷地と身体・時間へ続けて照合する。


## 農家まわりの道の付替え案

[[building-barn#農家まわりの道と同時に割り当てる敷地案]] に合わせ、東へ抜ける通りを納屋の南へ迂回させる。橋側と東への両端を保ち、牧草地へ続く枝道も迂回後の通りから [[facility-square-pasture#牧草地の北西を前室へ分ける敷地候補]] の外の床へ結び直す。納屋の干し草の戸へ向かう道は北西の既存の枝道へ接続する。物を運ぶ行先をなくして建物だけを置かない。

road_plan は変更する道の参照元の添字と元の両端、付替え後の中心線、両端の接続先と用途を持つ。stock_lock の接続先は同じ地図の設備の敷地候補と道の添字へ結び、局所のメートルから投影した接続点に一致させる。元の両端は参照元の取り違えを防ぐ照合値であり、道幅と材質の正は現行の地形の定義に持つ。道を検査から除く代わりに、幅を保った新しい全区間を使い、建物と待機範囲・畑などの予約へ照合する。直線で定義した中心線へ未検証の曲線を後から足さない。

現行の描画と住民の日課には採用しない。道と屋根・荷車の待機範囲の平面の照合に加え、土地の勾配と排水・ぬかるみ、補修する人と量、荷車の実際の動作と農家・畑・牧草地・鶏小屋への一日の物流を照合する。

付替えた道の幅を土地の予約へ重ねて確認したところ、牧草地へ続く道の終端は牧草地の縁にかかる。行先を残しただけで入口を照合済みにせず、`world/scene/construction/town.ts` の牧草地の柵の切れ目と路肩・入退場する身体と家畜を一緒に設計する。

牧草地の所有と入口・飼育と手入れは [[facility-square-pasture]] を参照する。
