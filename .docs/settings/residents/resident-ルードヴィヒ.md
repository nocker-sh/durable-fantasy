---
{
  "id": "resident-ルードヴィヒ",
  "kind": "residents",
  "title": "ルードヴィヒ",
  "status": "設計中",
  "source": ".docs/settings/towns/town-hue.md",
  "design_gate": "未通過",
  "town": "town-hue",
  "implementation": "未実装の設計案",
  "household": "hue-ludwig",
  "buildings": [
    "building-hue-ludwig"
  ],
  "bedroom": "room-hue-ludwig-2",
  "bedroom_candidates": [
    "room-hue-ludwig-2"
  ],
  "bed_id": "bed-hue-ludwig-1",
  "storage_ids": [
    "storage-hue-ludwig-1"
  ],
  "work": "機関の修繕の職人の案",
  "resident_proposal": {
    "scope": "unimplemented_town_household",
    "status": "proposed",
    "home_district": "H",
    "work_district": "W",
    "appearance_design": {
      "silhouette": "成人の人間。胴は厚めで、手を動かす作業をする体つき。寸法と元の骨格は未割当",
      "face_and_hair": "短い茶髪に白髪が混じる。眉は太く、口元は柔らかい。顔の描画と承認は未完了",
      "clothing": "くすんだ青の仕事上着と濃い茶のズボン、木屑や油を払うための前掛け。保護具と交換分は未設計",
      "neck_wrap": "灰色の首巻き。仕事中に機関の回転部へ垂らさない扱いを設計する",
      "work_equipment": "修繕する機関と道具を家の寝床へ積まない。道具の種類・持ち主と持ち歩く物は未設計"
    },
    "day_intent": {
      "sleep": "本人の寝台で眠り、寝具を整える。部屋の平面案はあるが、家具と寝具の立体・身体と換気・保温は未照合",
      "food": "家で調理と片付けをする。食材の受取・保管と調理の量は未設計",
      "water": "P から家庭用の水を受ける案。水源と担当・量・容器・往復は未設計",
      "work": "W の工房で小さな機関を修繕する案。受付・作業と部品の担当量・全室は未設計",
      "sanitation": "便所と汚水・排泄物の保管・搬出の担当と最終処理先は未設計",
      "laundry": "衣服と首巻き・寝具を手入れし、灰を避けて室内で干す。洗濯量と乾燥容量・実際の所要時間は未設計",
      "rest": "帰宅後に食べて休み、仕事を終えた後も家事と睡眠の時間を残す"
    },
    "pending": [
      "工房と部屋・仕事の量と道具、供給者と受渡しの担当",
      "外見と身体・衣服の元の定義、仮に予約した時刻・移動の実際の動作と所要時間",
      "住まいと水・食事・便所・衣服の手入れの実物と身体"
    ],
    "work_district_role": "work",
    "day_plan": {
      "scope": "resident_workday_time_reservation",
      "status": "proposed",
      "clock": "jst_midnight_minutes",
      "segments": [
        {
          "kind": "stay",
          "from_min": 0,
          "to_min": 480,
          "purpose": "本人の寝台で眠る",
          "activity": "sleep",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-2"
          }
        },
        {
          "kind": "travel",
          "from_min": 480,
          "to_min": 485,
          "purpose": "便所へ移る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-2"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          },
          "room_route": [
            "room-hue-ludwig-2",
            "room-hue-ludwig-hall",
            "room-hue-ludwig-toilet"
          ]
        },
        {
          "kind": "stay",
          "from_min": 485,
          "to_min": 500,
          "purpose": "用便と手洗い",
          "activity": "hygiene",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          }
        },
        {
          "kind": "travel",
          "from_min": 500,
          "to_min": 505,
          "purpose": "食事室へ移る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "room_route": [
            "room-hue-ludwig-toilet",
            "room-hue-ludwig-hall",
            "room-hue-ludwig-1"
          ]
        },
        {
          "kind": "stay",
          "from_min": 505,
          "to_min": 525,
          "purpose": "朝食を用意する",
          "activity": "prepare_food",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "stay",
          "from_min": 525,
          "to_min": 545,
          "purpose": "朝食",
          "activity": "meal",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "stay",
          "from_min": 545,
          "to_min": 555,
          "purpose": "朝食の片付け",
          "activity": "cleanup",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "travel",
          "from_min": 555,
          "to_min": 560,
          "purpose": "燃料と灰の室へ移る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-fuel"
          },
          "room_route": [
            "room-hue-ludwig-1",
            "room-hue-ludwig-hall",
            "room-hue-ludwig-fuel"
          ]
        },
        {
          "kind": "stay",
          "from_min": 560,
          "to_min": 575,
          "purpose": "燃料を用意し冷えた灰を扱う",
          "activity": "fuel_ash",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-fuel"
          }
        },
        {
          "kind": "travel",
          "purpose": "燃料と灰の手入れを終え、手洗いへ移る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-fuel"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          },
          "from_min": 575,
          "to_min": 580,
          "room_route": [
            "room-hue-ludwig-fuel",
            "room-hue-ludwig-hall",
            "room-hue-ludwig-toilet"
          ]
        },
        {
          "kind": "stay",
          "purpose": "灰と燃料を扱った手を洗う",
          "activity": "hygiene",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          },
          "from_min": 580,
          "to_min": 585
        },
        {
          "kind": "travel",
          "purpose": "手洗い後に汲水の区画へ移る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          },
          "to": {
            "kind": "district",
            "symbol": "P"
          },
          "from_min": 585,
          "to_min": 590,
          "room_route": [
            "room-hue-ludwig-toilet",
            "room-hue-ludwig-hall"
          ]
        },
        {
          "kind": "stay",
          "from_min": 590,
          "to_min": 605,
          "purpose": "家庭用水を受ける",
          "activity": "water",
          "place": {
            "kind": "district",
            "symbol": "P"
          }
        },
        {
          "kind": "travel",
          "from_min": 605,
          "to_min": 615,
          "purpose": "水を持って帰る",
          "from": {
            "kind": "district",
            "symbol": "P"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "room_route": [
            "room-hue-ludwig-hall",
            "room-hue-ludwig-1"
          ]
        },
        {
          "kind": "stay",
          "from_min": 615,
          "to_min": 625,
          "purpose": "飲用水の容器へ収める",
          "activity": "water",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "travel",
          "from_min": 625,
          "to_min": 635,
          "purpose": "工房へ移る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "to": {
            "kind": "district",
            "symbol": "W"
          },
          "room_route": [
            "room-hue-ludwig-1",
            "room-hue-ludwig-hall"
          ]
        },
        {
          "kind": "stay",
          "from_min": 635,
          "to_min": 795,
          "purpose": "午前の修繕作業",
          "activity": "work",
          "place": {
            "kind": "district",
            "symbol": "W"
          }
        },
        {
          "kind": "travel",
          "from_min": 795,
          "to_min": 800,
          "purpose": "食材の区画へ移る",
          "from": {
            "kind": "district",
            "symbol": "W"
          },
          "to": {
            "kind": "district",
            "symbol": "F"
          }
        },
        {
          "kind": "stay",
          "from_min": 800,
          "to_min": 815,
          "purpose": "食材を受け取る",
          "activity": "food_collection",
          "place": {
            "kind": "district",
            "symbol": "F"
          }
        },
        {
          "kind": "travel",
          "from_min": 815,
          "to_min": 825,
          "purpose": "食材を持って帰る",
          "from": {
            "kind": "district",
            "symbol": "F"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "room_route": [
            "room-hue-ludwig-hall",
            "room-hue-ludwig-1"
          ]
        },
        {
          "kind": "stay",
          "from_min": 825,
          "to_min": 840,
          "purpose": "昼食を用意する",
          "activity": "prepare_food",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "stay",
          "from_min": 840,
          "to_min": 860,
          "purpose": "昼食",
          "activity": "meal",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "stay",
          "from_min": 860,
          "to_min": 870,
          "purpose": "昼食の片付け",
          "activity": "cleanup",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "travel",
          "from_min": 870,
          "to_min": 880,
          "purpose": "工房へ戻る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "to": {
            "kind": "district",
            "symbol": "W"
          },
          "room_route": [
            "room-hue-ludwig-1",
            "room-hue-ludwig-hall"
          ]
        },
        {
          "kind": "stay",
          "from_min": 880,
          "to_min": 1090,
          "purpose": "午後の修繕作業",
          "activity": "work",
          "place": {
            "kind": "district",
            "symbol": "W"
          }
        },
        {
          "kind": "travel",
          "from_min": 1090,
          "to_min": 1100,
          "purpose": "帰宅する",
          "from": {
            "kind": "district",
            "symbol": "W"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "room_route": [
            "room-hue-ludwig-hall",
            "room-hue-ludwig-1"
          ]
        },
        {
          "kind": "stay",
          "from_min": 1100,
          "to_min": 1120,
          "purpose": "仕事の後に休む",
          "activity": "rest",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "travel",
          "from_min": 1120,
          "to_min": 1125,
          "purpose": "洗濯室へ移る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-wash"
          },
          "room_route": [
            "room-hue-ludwig-1",
            "room-hue-ludwig-hall",
            "room-hue-ludwig-wash"
          ]
        },
        {
          "kind": "stay",
          "from_min": 1125,
          "to_min": 1155,
          "purpose": "衣服を洗い室内で干す",
          "activity": "laundry",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-wash"
          }
        },
        {
          "kind": "travel",
          "purpose": "洗濯の後に手洗いへ移る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-wash"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          },
          "from_min": 1155,
          "to_min": 1160,
          "room_route": [
            "room-hue-ludwig-wash",
            "room-hue-ludwig-hall",
            "room-hue-ludwig-toilet"
          ]
        },
        {
          "kind": "stay",
          "purpose": "洗濯後、夕食を扱う前に手を洗う",
          "activity": "hygiene",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          },
          "from_min": 1160,
          "to_min": 1165
        },
        {
          "kind": "travel",
          "purpose": "手洗い後に食事室へ戻る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "from_min": 1165,
          "to_min": 1170,
          "room_route": [
            "room-hue-ludwig-toilet",
            "room-hue-ludwig-hall",
            "room-hue-ludwig-1"
          ]
        },
        {
          "kind": "stay",
          "from_min": 1170,
          "to_min": 1200,
          "purpose": "夕食を用意する",
          "activity": "prepare_food",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "stay",
          "from_min": 1200,
          "to_min": 1230,
          "purpose": "夕食",
          "activity": "meal",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "stay",
          "from_min": 1230,
          "to_min": 1245,
          "purpose": "夕食の片付け",
          "activity": "cleanup",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "travel",
          "from_min": 1245,
          "to_min": 1250,
          "purpose": "便所へ移る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          },
          "room_route": [
            "room-hue-ludwig-1",
            "room-hue-ludwig-hall",
            "room-hue-ludwig-toilet"
          ]
        },
        {
          "kind": "stay",
          "from_min": 1250,
          "to_min": 1265,
          "purpose": "用便と手洗い",
          "activity": "hygiene",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          }
        },
        {
          "kind": "travel",
          "from_min": 1265,
          "to_min": 1270,
          "purpose": "食事室へ戻る",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-toilet"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "room_route": [
            "room-hue-ludwig-toilet",
            "room-hue-ludwig-hall",
            "room-hue-ludwig-1"
          ]
        },
        {
          "kind": "stay",
          "from_min": 1270,
          "to_min": 1290,
          "purpose": "食事室を掃除する",
          "activity": "clean",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "stay",
          "from_min": 1290,
          "to_min": 1435,
          "purpose": "家で休む",
          "activity": "rest",
          "place": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          }
        },
        {
          "kind": "travel",
          "from_min": 1435,
          "to_min": 1440,
          "purpose": "寝室へ移り次の日の睡眠へつなぐ",
          "from": {
            "kind": "room",
            "room": "room-hue-ludwig-1"
          },
          "to": {
            "kind": "room",
            "room": "room-hue-ludwig-2"
          },
          "room_route": [
            "room-hue-ludwig-1",
            "room-hue-ludwig-hall",
            "room-hue-ludwig-2"
          ]
        }
      ],
      "pending": [
        "各時間は仮の予約。屋内の室の順序はあるが、実際の身体・荷物・戸の操作・各使用面への移動と所要時間、屋外の経路と距離は未照合",
        "食材と水・燃料の供給者・受取可能時刻・数量と容器、廃棄物の搬出と最終処理先が未設計",
        "調理・修繕・洗濯・乾燥の設備と一回の量・処理時間・保守、夜間の灯りと身体の休息を未照合"
      ]
    }
  },
  "issues": [
    "未実装の人物案。外見・日課の実行時の定義は存在しない",
    "住まいの平面と寝床・収納の使用面は案であり、立体・身体・仕事と生活の成立は未照合"
  ],
  "design_dependencies": [
    "town-hue",
    "map-hue-quarter",
    "building-hue-ludwig",
    "room-hue-ludwig-1",
    "room-hue-ludwig-2",
    "room-hue-ludwig-hall",
    "room-hue-ludwig-wash",
    "room-hue-ludwig-toilet",
    "room-hue-ludwig-fuel"
  ]
}
---
# ルードヴィヒ

## 人物と世帯

フエで小さな機関を修繕する職人の案である。一人の世帯として [[building-hue-ludwig]] に住み、[[room-hue-ludwig-2]] に本人の寝台と個人収納を持つ。現行の住民・外見・日課の定義にはまだ登録しない。ファンティエットの職人や世帯の名前を置き換えた人物にはしない。

## 仕事と収入のつながり

都市の W に工房を設け、持ち主から預かった機関を調べ、必要な部品を受け、直して返す仕事を考える。どの機関を誰から預かり、部品と道具が誰から来て、どれだけの時間で返せるかは未設計である。大きな組織や工場を追加せず、本人と仕事を頼む人の受渡しとして設計する。収入の量と食料・燃料の購入を成立した扱いにはしない。

## 一日の設計と外見

resident_proposal の day_intent と appearance_design は実装前の意図を持つ。本人が食べ、汲水と調理・片付けをし、家を掃除し、衣服と寝具を手入れし、休み眠ることを、仕事の外へ押し出さない。day_plan は日本時間の午前零時から次の午前零時までを一度だけ予約する勤務日の案である。場所を変える間は移動時間を取り、睡眠・食事・家事・仕事・休息を重ねない。移動の両端と夜中のつながりも照合する。実際の経路・荷重・扉の操作・身体と供給者の時刻は未照合であり、予約した長さで各仕事や暮らしが成立するとは扱わない。実行時の ROUTINES は登録しない。

外見は新しい個人として設計し、元の身体と衣服・道具の形、作業する姿勢とゲームの見た目へ照合してから描画する。文章が揃ったことを、画像の生成・採用や承認として扱わない。


## 家の中の移動と手洗い

移動の room_route は、出発する室から通る室を順に記す。食事室と寝間・便所・洗濯室・燃料と灰の室の間は、[[room-hue-ludwig-hall]] を通る。屋外へ出るときと帰るときは廊下の正面の戸口を使う。室の順序と相互の接続、本人の利用できる室であることを建物の平面へ照合する。各室の戸口から使用面までの身体の軌跡、開閉と荷物を含む動作、屋外の経路はまだ成立した扱いにしない。

燃料と灰の手入れの後は [[room-hue-ludwig-toilet]] で手を洗ってから汲水へ向かう。洗濯の後も、同じ手洗いを通って食事室へ戻り夕食を用意する。手洗いと往復の時間を仕事や睡眠へ重ねず、帰宅後の休息の予約の中から別に取る。石鹸と水・排水、汚れた道具と衣服の扱い、設備と供給の量は未設計であり、順序を決めただけで衛生の成立へ広げない。
