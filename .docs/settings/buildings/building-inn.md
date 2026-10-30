---
{
  "id": "building-inn",
  "kind": "buildings",
  "title": "ゲルダの宿",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "household": "inn",
  "residents": [
    "resident-ゲルダ",
    "resident-ニーナ",
    "resident-ゼップ"
  ],
  "rooms": [
    "room-inn-1",
    "room-inn-2",
    "room-inn-lower-stairs",
    "room-inn-upper-stairs",
    "room-inn-hall",
    "room-inn-3",
    "room-inn-4",
    "room-inn-5",
    "room-inn-6",
    "room-inn-drying"
  ],
  "role": "public",
  "issues": [
    "姉妹の家の移設を前提とする南側の敷地案。地形と運用は未照合",
    "平面案の敷地・道路と川、屋根・地形・描画の照合未完了",
    "給排水と便所・洗濯・燃料と灰、戸・窓・梁と頭上高、収納容量と日課の照合未完了"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-inn-1",
    "room-inn-2",
    "room-inn-3",
    "room-inn-4",
    "room-inn-5",
    "room-inn-6",
    "room-inn-lower-stairs",
    "room-inn-upper-stairs",
    "room-inn-hall",
    "building-h5",
    "room-inn-drying"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 22,
    "depth": 24,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-inn-1",
          "room-inn-2",
          "room-inn-lower-stairs",
          "room-inn-drying"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-inn-upper-stairs",
          "room-inn-hall",
          "room-inn-3",
          "room-inn-4",
          "room-inn-5",
          "room-inn-6"
        ]
      }
    ]
  },
  "floor_levels": [
    {
      "floor": 0,
      "elevation_m": 0,
      "ceiling_elevation_m": 2.32
    },
    {
      "floor": 1,
      "elevation_m": 2.52,
      "ceiling_elevation_m": 4.72
    }
  ],
  "stair_sections": [
    {
      "lower_room": "room-inn-lower-stairs",
      "upper_room": "room-inn-upper-stairs",
      "furniture": "S",
      "risers": 14,
      "going_m": 0.28,
      "axis": "y",
      "landing_depth_m": 1,
      "clear_width_m": 0.9,
      "lower_end": "end",
      "opening_length_m": 3.64,
      "rail_inset_m": 0.05
    }
  ],
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 4.72,
    "ridge_underside_m": 7.2,
    "overhang_m": 0.3,
    "material": "roof"
  },
  "site_plan": {
    "origin": [
      21.3,
      34.6
    ],
    "rotation_quarters": 2,
    "status": "proposed",
    "unresolved": [
      "基礎・地形と段差、屋根・窓と梁、給排水と便所・洗濯場",
      "北の通りと広場への客と荷物の往復、日課との照合"
    ],
    "approaches": [
      {
        "room": "room-inn-1",
        "door": [
          16,
          5
        ],
        "width_m": 1,
        "points_tiles": [
          [
            21.3,
            39.24285714285715
          ],
          [
            20.7,
            39.24285714285715
          ],
          [
            20.7,
            33.5
          ],
          [
            24,
            33.5
          ]
        ]
      }
    ]
  }
}
---
# ゲルダの宿

## 使い手と役割

宿のゲルダとニーナの建物である。同居人はゲルダ、ニーナ、ゼップ。宿と食堂。野菜と魚は市場から。娘のニーナが給仕、ゼップが台所。

## 部屋の構成

地上階の [[room-inn-1]] と [[room-inn-2]] を [[room-inn-lower-stairs]] へつなぐ。上階の [[room-inn-upper-stairs]] と [[room-inn-hall]] から、世帯の [[room-inn-3]]・[[room-inn-4]] と客用の [[room-inn-5]]・[[room-inn-6]] へ別々に入る。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事の設備は「大きなかまど」。材料、仕掛品、完成品、道具の収納と手入れ場所を区別する。

## 現状との差分

現行の家具候補は長卓、卓、長椅子、椅子×4、大鍋、酒樽、寝台×6。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。


## 全階の平面案

西の共用階段と廊下から、世帯の寝室と客室へ別々に入る。地上階は食堂と台所を分け、世帯三人と三客枠に寝台・専用収納を置く。上下の階段と全室の共有壁・戸口を同じセル寸法で合わせる。拡張した外形を現行の町へそのまま置けるとは判断しない。敷地・道路と川、隣家・屋根・基礎と地形を詰めるまでは、現行の描画と位置を切り替えない。

## 階段と階の高さ

階段は西側の専用区画で上下をそろえ、地上階の南端から上階の北端へ上がる。床と天井の高さ、段と踊り場、手摺の占有と床開口を stair_sections で対応させる。寝具や客の荷物を持つ姿勢、梁と照明、屋根と火災時の経路はこの断面の検査だけで完了にしない。

## 広場と敷地の再検討

部屋の余分な広さを減らし、寝台・収納・階段・家具と使用面の寸法は保った平面へ組み直した。台所の清潔な食器棚は西側から使い、同時に人が立っても調理場へ入る経路を残す。元の宿の北まで広げる候補は道と川・隣家には重ならないが、広場の利用場所へ入り込むため敷地として採用しない。この北側候補の原点は採用しない。

## 広場を残す南の敷地案

[[building-h5]] の東岸への移設を前提に、宿は南の通りの南側へ置く。入口は建物を半回転させた敷地では西へ向き、川沿いへ客を誘導せず、西の通路から北の道へ出る。屋根と身体幅のある接続を、道・川・隣家・庭と設備へ照合する。広場の滞在場所を宿の床へ使わない。

この案は姉妹の家の現行位置を残したまま採用できない。二つの建物資料の依存関係として持ち、敷地と日課・物流・描画を一緒に照合する。飲食物と寝具の搬送、地形と段差・基礎、客と町の住民が使う時間と広場への往復は未確認である。


## 室内干しと食堂の分離

[[room-inn-drying]] を食堂の北側から分ける。寝台と収納、食卓と椅子・階段の寸法を縮めず、六席と受付・暖房の使う側を組み直す。布を掛ける占有を客の通り道にしない。入口と敷地から道への接続も新しい戸口へ結び直す。乾燥容量と換気・湿気、掛ける身体と重さ、全寝具と衣服の交換の頻度は未照合である。


室内干しの専用室を詰め込んで通路を潰さず、建物の南側へ床を二セル増やす。上下の階段区画と客室の外周を同じ外形へそろえ、台所を南へ寄せる。寝台・収納・家具と使用面の寸法は維持する。敷地と屋根・道と川は拡張後の外形で照合する。
